import db from "../config/db.js";

/**
 * Add a new stock batch (one row = one batch)
 * Body: { ShopID, ItemID, SupplierID (optional), Quantity, ManfDate }
 */
export async function addStock(req, res) {
    const { ShopID, ItemID, SupplierID, Quantity, ManfDate } = req.body;

    if (!ShopID || !ItemID || Quantity == null || !ManfDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO Stock (ShopID, ItemID, SupplierID, Quantity, ManfDate)
             VALUES (?, ?, ?, ?, ?)`,
            [ShopID, ItemID, SupplierID || null, Quantity, ManfDate]
        );

        res.json({
            message: "Stock added successfully",
            StockID: result.insertId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * Get stock batches for a specific shop
 */
export async function getStockByShop(req, res) {
    const { shopID } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT 
              Stock.StockID,
              Stock.ItemID,
              Stock.Quantity,
              Stock.ManfDate,
              Items.ItemName,
              Items.Barcode,
              Items.ShelfLife,
              DATE_ADD(Stock.ManfDate, INTERVAL Items.ShelfLife DAY) AS ExpiryDate
            FROM Stock
            JOIN Items ON Stock.ItemID = Items.ItemID
            WHERE Stock.ShopID = ?
            ORDER BY ExpiryDate ASC
        `, [shopID]);

        res.json(rows);
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}


/**
 * Update stock quantity (useful when billing reduces stock or manual corrections)
 * Body: { Quantity }
 */
export async function updateStockQuantity(req, res) {
    const { stockID } = req.params;
    const { Quantity } = req.body;

    if (Quantity == null) return res.status(400).json({ error: "Quantity missing" });

    try {
        await db.query(`UPDATE Stock SET Quantity = ? WHERE StockID = ?`, [Quantity, stockID]);
        res.json({ message: "Stock quantity updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
