import db from "../config/db.js";

export const createInvoice = async (req, res) => {
  const ShopID = req.user?.ShopID;
  const { items } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let totalAmount = 0;
    const invoiceItems = [];

    // 1️⃣ Fetch items
    for (const item of items) {
      const result = await client.query(
        `SELECT "ItemName","Price"
         FROM items
         WHERE "ItemID"=$1 AND "ShopID"=$2`,
        [item.itemID, ShopID]
      );

      if (result.rows.length === 0) throw new Error("Invalid item");

      const dbItem = result.rows[0];
      const qty = Number(item.qty);

      const lineTotal = dbItem.Price * qty;
      totalAmount += lineTotal;

      invoiceItems.push({
        itemID: item.itemID,
        qty,
        price: dbItem.Price,
        lineTotal
      });
    }

    // 2️⃣ FIFO stock deduction
    for (const item of items) {
      let remaining = item.qty;

      const stockRows = await client.query(
        `SELECT "StockID","Quantity"
         FROM stock
         WHERE "ShopID"=$1 AND "ItemID"=$2
         ORDER BY "ExpiryDate" ASC
         FOR UPDATE`,
        [ShopID, item.itemID]
      );

      for (const stock of stockRows.rows) {
        if (remaining === 0) break;

        const take = Math.min(stock.Quantity, remaining);
        const newQty = stock.Quantity - take;

        await client.query(
          `UPDATE stock SET "Quantity"=$1 WHERE "StockID"=$2`,
          [newQty, stock.StockID]
        );

        remaining -= take;
      }

      if (remaining > 0) throw new Error("Insufficient stock");
    }

    // 3️⃣ Insert billing
    const bill = await client.query(
      `INSERT INTO billing ("ShopID","TotalAmount")
       VALUES ($1,$2)
       RETURNING "ReceiptID"`,
      [ShopID, totalAmount]
    );

    const receiptID = bill.rows[0].ReceiptID;

    // 4️⃣ Billing details
    for (const item of invoiceItems) {
      await client.query(
        `INSERT INTO billingdetails
        ("ReceiptID","ItemID","Quantity","Price","Discount")
        VALUES ($1,$2,$3,$4,$5)`,
        [receiptID, item.itemID, item.qty, item.price, 0]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      receiptID,
      totalAmount
    });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });

  } finally {
    client.release();
  }
};