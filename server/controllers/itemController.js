import db from "../config/db.js";

export async function getAllItems(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT Items.*, Category.CategoryName
            FROM Items
            LEFT JOIN Category ON Items.CategoryID = Category.CategoryID
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function addItem(req, res) {
    const { ItemName, Barcode, CategoryID, ShelfLife, Source } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO Items (ItemName, Barcode, CategoryID, ShelfLife, Source)
             VALUES (?, ?, ?, ?, ?)`,
            [ItemName, Barcode, CategoryID, ShelfLife, Source]
        );

        res.json({ message: "Item added", ItemID: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
