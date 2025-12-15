import db from "../config/db.js";

export async function getAllItems(req, res) {
    const ShopID = req.user?.ShopID;
    if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

    try {
        const [rows] = await db.query(
            `
            SELECT 
                Items.ItemID,
                Items.ItemName,
                Items.Barcode,
                Items.Source,
                Category.CategoryName
            FROM Items
            LEFT JOIN Category ON Items.CategoryID = Category.CategoryID
            WHERE Items.ShopID = ?
            ORDER BY Items.CreatedAt DESC
            `,
            [ShopID]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch items" });
    }
}

export async function addItem(req, res) {
    const ShopID = req.user?.ShopID;
    if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

    const { ItemName, Barcode, CategoryID, Source } = req.body;

    if (!ItemName || !Barcode) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const [existing] = await db.query(
            `SELECT ItemID FROM Items WHERE ShopID = ? AND Barcode = ?`,
            [ShopID, Barcode]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: "Item already exists" });
        }

        const [result] = await db.query(
            `
            INSERT INTO Items (ShopID, ItemName, Barcode, CategoryID, Source)
            VALUES (?, ?, ?, ?, ?)
            `,
            [ShopID, ItemName, Barcode, CategoryID || null, Source || "API"]
        );

        res.json({ success: true, ItemID: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add item" });
    }
}
