import generateInvoice from "../services/generateInvoice.js";
import fs from "fs";
import db from "../config/db.js";

export const createInvoice = async (req, res) => {
  const ShopID = req.user?.ShopID;
  const invoiceData = req.body;
  const { items } = invoiceData;

  if (!ShopID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No bill items provided" });
  }

  const conn = await db.getConnection();

  try {
    // 🔐 1. Start transaction
    await conn.beginTransaction();

    // 🔄 2. Reduce stock
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
          `
          UPDATE Stock
          SET Quantity = ?
          WHERE StockID = ?
          `,
          [newQty, stock.StockID]
        );

        remaining -= take;
      }

      if (remaining > 0) {
        throw new Error(`Insufficient stock for item ${item.itemID}`);
      }

    }

    // ✅ 3. Commit stock changes
    await conn.commit();

    // 🧾 4. Generate invoice PDF
    const pdfPath = await generateInvoice(invoiceData);

    // 📤 5. Send PDF & cleanup
    res.download(pdfPath, "invoice.pdf", (err) => {
      try { fs.unlinkSync(pdfPath); } catch (e) {}
      if (err) console.error("Download error:", err);
    });

  } catch (err) {
    // ❌ Rollback everything if anything fails
    await conn.rollback();
    console.error("Invoice error:", err.message);

    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};

