import db from "../config/db.js";

export async function loginOwner(req, res) {
    const { phone, ownerName } = req.body;

    try {
        // Lookup
        const result = await db.query(
            "SELECT ShopID, OwnerName, Phone, Email FROM shop WHERE Phone = $1",
            [phone]
        );

        const rows = result.rows;

        if (rows.length > 0) {
            return res.json({
                success: true,
                shop: rows[0],
                isNew: false
            });
        }

        // Insert
        const insert = await db.query(
            "INSERT INTO shop (OwnerName, Phone, Email) VALUES ($1, $2, $3) RETURNING *",
            [ownerName, phone, null]
        );

        const newUser = insert.rows[0];

        return res.json({
            success: true,
            isNew: true,
            shop: newUser
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

