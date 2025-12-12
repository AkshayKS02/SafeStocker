import db from "../config/db.js";

export async function loginOwner(req, res) {
    const { phone, ownerName } = req.body;

    try {
        // 1. Lookup
        const [rows] = await db.query(
            "SELECT ShopID, OwnerName, Phone, Email FROM Shop WHERE Phone = ?",
            [phone]
        );

        // 2. If exists → return
        if (rows.length > 0) {
            return res.json({
                success: true,
                shop: rows[0],
                isNew: false
            });
        }

        // 3. If not exists → INSERT new shop owner
        const [result] = await db.query(
            "INSERT INTO Shop (OwnerName, Phone, Email) VALUES (?, ?, ?)",
            [ownerName, phone, null]
        );

        return res.json({
            success: true,
            isNew: true,
            shop: {
                ShopID: result.insertId,
                OwnerName: ownerName,
                Phone: phone,
                Email: null
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}


