import db from "../config/db.js";

export async function addStock(req, res) {
    const ShopID = req.user?.ShopID;
    const { ItemID, SupplierID, Quantity, ManufactureDate, ExpiryDate } = req.body;

    if (!ShopID) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!ItemID || !Quantity || !ManufactureDate || !ExpiryDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const [result] = await db.query(
            `
            INSERT INTO Stock (ShopID, ItemID, SupplierID, Quantity, ManufactureDate, ExpiryDate)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                ShopID,
                ItemID,
                SupplierID || null,
                Quantity,
                ManufactureDate,
                ExpiryDate
            ]
        );

        res.json({
            success: true,
            StockID: result.insertId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add stock" });
    }
}

export async function getStockByShop(req, res) {
    const ShopID = req.user?.ShopID;

    if (!ShopID) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const [rows] = await db.query(
            `
            SELECT
                Stock.StockID,
                Stock.ItemID,
                Stock.Quantity,
                Stock.ManufactureDate,
                Stock.ExpiryDate,
                Items.ItemName,
                Items.Barcode,
                Items.price
            FROM Stock
            JOIN Items ON Stock.ItemID = Items.ItemID
            WHERE Stock.ShopID = ? and Stock.Quantity > 0
            ORDER BY Stock.ExpiryDate ASC
            `,
            [ShopID]
        );

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch stock" });
    }
}

export async function updateStockQuantity(req, res) {
    const ShopID = req.user?.ShopID;
    const { stockID } = req.params;
    const { Quantity } = req.body;

    if (!ShopID) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (Quantity == null) {
        return res.status(400).json({ error: "Quantity missing" });
    }

    try {
        await db.query(
            `
            UPDATE Stock
            SET Quantity = ?
            WHERE StockID = ? AND ShopID = ?
            `,
            [Quantity, stockID, ShopID]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update stock" });
    }
}

export async function deleteExpiredStock(req, res) {
    const ShopID = req.user?.ShopID;
    const { stockID } = req.params;

    if (!ShopID) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get stock + price
        const [rows] = await connection.query(`
            SELECT 
                Stock.Quantity,
                Stock.ExpiryDate,
                Stock.ItemID,
                Items.Price
            FROM Stock
            JOIN Items ON Stock.ItemID = Items.ItemID
            WHERE Stock.StockID = ? AND Stock.ShopID = ?
        `, [stockID, ShopID]);

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Stock not found" });
        }

        const stock = rows[0];

        // Check expiry
        const today = new Date();
        const expiry = new Date(stock.ExpiryDate);

        if (expiry > today) {
            await connection.rollback();
            return res.status(400).json({ error: "Stock not expired yet" });
        }

        if (stock.Quantity <= 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Stock already empty" });
        }

        const lossAmount = stock.Quantity * stock.Price;

        // Insert into Losses table
        await connection.query(`
            INSERT INTO Losses 
            (StockID, ItemID, QuantityLost, LossAmount, ShopID)
            VALUES (?, ?, ?, ?, ?)
        `, [
            stockID,
            stock.ItemID,
            stock.Quantity,
            lossAmount,
            ShopID
        ]);

        // Set quantity to 0 instead of delete
        await connection.query(`
            UPDATE Stock
            SET Quantity = 0
            WHERE StockID = ?
        `, [stockID]);

        await connection.commit();

        res.json({
            success: true,
            lossAmount
        });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to process expired stock" });
    } finally {
        connection.release();
    }
}


