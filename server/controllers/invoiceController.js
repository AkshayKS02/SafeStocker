import db from "../config/db.js";
import fs from "fs";
import generateInvoicePDF from "../services/generateInvoice.js";

// Shared transaction logic — returns { receiptID, invoiceItems, totalAmount }
async function processInvoiceTransaction(client, ShopID, items) {
  await client.query("BEGIN");

  let totalAmount = 0;
  const invoiceItems = [];

  for (const item of items) {
    const result = await client.query(
      `SELECT "ItemName","Price" FROM items WHERE "ItemID"=$1 AND "ShopID"=$2`,
      [item.itemID, ShopID]
    );
    if (result.rows.length === 0) throw new Error(`Invalid item: ${item.itemID}`);

    const dbItem = result.rows[0];
    const qty = Number(item.qty);
    const lineTotal = dbItem.Price * qty;
    totalAmount += lineTotal;
    invoiceItems.push({ itemID: item.itemID, name: dbItem.ItemName, qty, price: dbItem.Price, lineTotal });
  }

  for (const item of items) {
    let remaining = Number(item.qty);
    const stockRows = await client.query(
      `SELECT "StockID","Quantity" FROM stock
       WHERE "ShopID"=$1 AND "ItemID"=$2 AND "Quantity">0
       ORDER BY "ExpiryDate" ASC FOR UPDATE`,
      [ShopID, item.itemID]
    );
    for (const stock of stockRows.rows) {
      if (remaining === 0) break;
      const take = Math.min(stock.Quantity, remaining);
      await client.query(
        `UPDATE stock SET "Quantity"=$1 WHERE "StockID"=$2`,
        [stock.Quantity - take, stock.StockID]
      );
      remaining -= take;
    }
    if (remaining > 0) throw new Error(`Insufficient stock for item ${item.itemID}`);
  }

  const bill = await client.query(
    `INSERT INTO billing ("ShopID","TotalAmount") VALUES ($1,$2) RETURNING "ReceiptID"`,
    [ShopID, totalAmount]
  );
  const receiptID = bill.rows[0].ReceiptID;

  for (const item of invoiceItems) {
    await client.query(
      `INSERT INTO billingdetails ("ReceiptID","ItemID","Quantity","Price","Discount")
       VALUES ($1,$2,$3,$4,$5)`,
      [receiptID, item.itemID, item.qty, item.price, 0]
    );
  }

  await client.query("COMMIT");
  return { receiptID, invoiceItems, totalAmount };
}

// Mobile endpoint — returns JSON only (PDF generated client-side)
export const createInvoiceMobile = async (req, res) => {
  const ShopID = req.user?.ShopID;
  const { items } = req.body;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "No items provided" });

  const client = await db.connect();
  try {
    const { receiptID, invoiceItems, totalAmount } = await processInvoiceTransaction(client, ShopID, items);
    return res.json({ receiptID, totalAmount, items: invoiceItems });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Mobile invoice error:", err);
    return res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const createInvoice = async (req, res) => {
  const ShopID = req.user?.ShopID;
  const { items } = req.body;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items provided" });
  }

  const client = await db.connect();
  try {
    const { receiptID, invoiceItems, totalAmount } = await processInvoiceTransaction(client, ShopID, items);

    const pdfPath = await generateInvoicePDF({ receiptID, items: invoiceItems, totalAmount });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="invoice-${receiptID}.pdf"`);
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
    stream.on("end", () => fs.unlink(pdfPath, () => {}));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Invoice error:", err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};
