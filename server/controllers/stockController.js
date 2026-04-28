import db from "../config/db.js";

// ➕ ADD STOCK
export async function addStock(req, res) {
  const ShopID = req.user?.ShopID;
  const { ItemID, SupplierID, Quantity, ManufactureDate, ExpiryDate } = req.body;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await db.query(
      `INSERT INTO stock 
      ("ShopID","ItemID","SupplierID","Quantity","ManufactureDate","ExpiryDate")
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING "StockID"`,
      [ShopID, ItemID, SupplierID || null, Quantity, ManufactureDate, ExpiryDate]
    );

    res.json({ success: true, StockID: result.rows[0].StockID });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add stock" });
  }
}

export async function getStockByShop(req, res) {
  const ShopID = req.user?.ShopID;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await db.query(
      `SELECT
        s."StockID",
        s."ItemID",
        s."Quantity",
        s."ManufactureDate",
        s."ExpiryDate",
        i."ItemName",
        i."Barcode",
        i."Price"
      FROM stock s
      JOIN items i ON s."ItemID" = i."ItemID"
      WHERE s."ShopID" = $1 AND s."Quantity" > 0
      ORDER BY s."ExpiryDate" ASC`,
      [ShopID]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stock" });
  }
}

export async function updateStockQuantity(req, res) {
  const ShopID = req.user?.ShopID;
  const { stockID } = req.params;
  const { Quantity } = req.body;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  try {
    await db.query(
      `UPDATE stock
       SET "Quantity" = $1
       WHERE "StockID" = $2 AND "ShopID" = $3`,
      [Quantity, stockID, ShopID]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
}

export async function deleteExpiredStock(req, res) {
  const ShopID = req.user?.ShopID;
  const { stockID } = req.params;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT 
        s."Quantity",
        s."ExpiryDate",
        s."ItemID",
        i."Price"
      FROM stock s
      JOIN items i ON s."ItemID" = i."ItemID"
      WHERE s."StockID" = $1 AND s."ShopID" = $2`,
      [stockID, ShopID]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Stock not found" });
    }

    const stock = result.rows[0];

    const today = new Date();
    const expiry = new Date(stock.ExpiryDate);

    if (expiry > today) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Not expired yet" });
    }

    if (stock.Quantity <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Already empty" });
    }

    const lossAmount = stock.Quantity * stock.Price;

    // insert loss
    await client.query(
      `INSERT INTO losses 
      ("StockID","ItemID","QuantityLost","LossAmount","ShopID")
      VALUES ($1,$2,$3,$4,$5)`,
      [stockID, stock.ItemID, stock.Quantity, lossAmount, ShopID]
    );

    // zero stock
    await client.query(
      `UPDATE stock SET "Quantity" = 0 WHERE "StockID" = $1`,
      [stockID]
    );

    await client.query("COMMIT");

    res.json({ success: true, lossAmount });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to process expired stock" });

  } finally {
    client.release();
  }
}