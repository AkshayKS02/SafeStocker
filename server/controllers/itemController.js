import db from "../config/db.js";

export async function getAllItems(req, res) {
  const ShopID = req.user?.ShopID;
  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await db.query(
      `SELECT 
        i."ItemID",
        i."ItemName",
        i."Barcode",
        i."Source",
        i."Price",
        c."CategoryName"
      FROM items i
      LEFT JOIN category c ON i."CategoryID" = c."CategoryID"
      WHERE i."ShopID" = $1
      ORDER BY i."CreatedAt" DESC`,
      [ShopID]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed items" });
  }
}

export async function addItem(req, res) {
  const ShopID = req.user?.ShopID;
  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  const { ItemName, Barcode, CategoryID, Source, Price } = req.body;

  try {
    const check = await db.query(
      `SELECT 1 FROM items WHERE "ShopID"=$1 AND "Barcode"=$2`,
      [ShopID, Barcode]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Item exists" });
    }

    const result = await db.query(
      `INSERT INTO items 
      ("ShopID","ItemName","Barcode","CategoryID","Source","Price")
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING "ItemID"`,
      [ShopID, ItemName, Barcode, CategoryID || null, Source || "API", Price]
    );

    res.json({ success: true, ItemID: result.rows[0].ItemID });

  } catch (err) {
    res.status(500).json({ error: "Add item failed" });
  }
}