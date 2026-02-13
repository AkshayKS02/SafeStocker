import generateInvoice from "../services/generateInvoice.js";
import fs from "fs";
import db from "../config/db.js";

export const createInvoice = async (req, res) => {
  const ShopID = req.user?.ShopID;
  const { items } = req.body;

  if (!ShopID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No bill items provided" });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    let totalAmount = 0;
    const invoiceItems = []; // 🔹 for PDF + billing details

    // 1️⃣ Fetch item data + calculate total
    for (const item of items) {

      const [rows] = await conn.query(
        `SELECT ItemName, Price FROM Items WHERE ItemID = ? AND ShopID = ?`,
        [item.itemID, ShopID]
      );

      if (rows.length === 0) {
        throw new Error("Invalid item in bill");
      }

      const dbItem = rows[0];
      const qty = Number(item.qty) || 0;

      if (qty <= 0) {
        throw new Error("Invalid quantity");
      }

      const lineTotal = dbItem.Price * qty;
      totalAmount += lineTotal;

      invoiceItems.push({
        itemID: item.itemID,
        name: dbItem.ItemName,
        qty,
        price: dbItem.Price,
        lineTotal
      });
    }

    // 2️⃣ Reduce stock (FIFO)
    for (const item of items) {

      let remaining = item.qty;

      const [rows] = await conn.query(
        `
        SELECT StockID, Quantity
        FROM Stock
        WHERE ShopID = ? AND ItemID = ?
        ORDER BY ExpiryDate ASC
        FOR UPDATE
        `,
        [ShopID, item.itemID]
      );

      if (rows.length === 0) {
        throw new Error(`No stock found for item ${item.itemID}`);
      }

      for (const stock of rows) {
        if (remaining === 0) break;

        const take = Math.min(stock.Quantity, remaining);
        const newQty = stock.Quantity - take;

        await conn.query(
          `UPDATE Stock SET Quantity = ? WHERE StockID = ?`,
          [newQty, stock.StockID]
        );

        remaining -= take;
      }

      if (remaining > 0) {
        throw new Error(`Insufficient stock for item ${item.itemID}`);
      }
    }

    // 3️⃣ Insert into Billing
    const [billingResult] = await conn.query(
      `
      INSERT INTO Billing (ShopID, TotalAmount)
      VALUES (?, ?)
      `,
      [ShopID, totalAmount]
    );

    const receiptID = billingResult.insertId;

    // 4️⃣ Insert into BillingDetails
    for (const item of invoiceItems) {
      await conn.query(
        `
        INSERT INTO BillingDetails
        (ReceiptID, ItemID, Quantity, Price, Discount)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          receiptID,
          item.itemID,
          item.qty,
          item.price,
          0
        ]
      );
    }

    // 5️⃣ Commit transaction
    await conn.commit();

    // 6️⃣ Generate invoice PDF (using safe DB values)
    const pdfPath = await generateInvoice({
      receiptID,
      items: invoiceItems,
      totalAmount
    });

    res.download(pdfPath, "invoice.pdf", (err) => {
      try { fs.unlinkSync(pdfPath); } catch (e) {}
      if (err) console.error("Download error:", err);
    });

  } catch (err) {
    await conn.rollback();
    console.error("Invoice error:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};
