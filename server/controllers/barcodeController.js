import db from "../config/db.js";
import { fetchFromOpenFoodFacts } from "../services/offAPI.js";

let lastScan = null;

export async function handleBarcode(req, res) {
    const { barcode } = req.body;

    if (!barcode) return res.status(400).json({ error: "barcode missing" });

    try {
        // CHECK LOCAL DB FIRST
        const [rows] = await db.query(
            "SELECT * FROM Items WHERE Barcode = ?",
            [barcode]
        );

        if (rows.length > 0) {
            const item = rows[0];

            lastScan = { 
                from: "database",
                product: {
                    barcode: item.Barcode,
                    name: item.ItemName,
                    brand: "Local Entry",
                    package_quantity: "",
                    ItemID: item.ItemID,
                    CategoryID: item.CategoryID,
                    ShelfLife: item.ShelfLife
                }
            };

            return res.json({
                found: true,
                source: "database",
                product: lastScan.product
            });
        }

        // NOT IN DB → CALL OPEN FOOD FACTS
        const offData = await fetchFromOpenFoodFacts(barcode);

        if (!offData.product) {
            lastScan = { product: null };
            return res.json({ found: false });
        }

        const p = offData.product;

        const product = {
            barcode,
            name: p.product_name || "Unknown product",
            brand: p.brands || "Unknown brand",
            package_quantity: p.quantity || "",
        };

        // AUTO-SAVE TO ITEMS TABLE
        const [insertResult] = await db.query(
            `INSERT INTO Items (ItemName, Barcode, CategoryID, ShelfLife, Source)
             VALUES (?, ?, ?, ?, 'API')`,
            [
                product.name,
                product.barcode,
                null,          // CategoryID is not known from OFF
                0              // ShelfLife is unknown → user can update later
            ]
        );

        const newItemID = insertResult.insertId;

        // Store the scan result
        lastScan = { 
            from: "off_api",
            product: {
                ...product,
                ItemID: newItemID,
                CategoryID: null,
                ShelfLife: 0
            }
        };

        return res.json({
            found: true,
            source: "off_api",
            product: lastScan.product,
            autoSaved: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}
