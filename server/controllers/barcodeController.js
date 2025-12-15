import db from "../config/db.js";
import { fetchFromOpenFoodFacts } from "../services/offAPI.js";

export async function handleBarcode(req, res) {
    const { barcode } = req.body;
    const ShopID = req.user?.ShopID;

    if (!barcode) return res.status(400).json({ error: "barcode missing" });
    if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

    try {
        const [rows] = await db.query(
            "SELECT ItemID, ItemName, Barcode, CategoryID, Source FROM Items WHERE ShopID = ? AND Barcode = ?",
            [ShopID, barcode]
        );

        if (rows.length > 0) {
            return res.json({
                found: true,
                source: "database",
                product: {
                    ItemID: rows[0].ItemID,
                    name: rows[0].ItemName,
                    barcode: rows[0].Barcode,
                    CategoryID: rows[0].CategoryID
                }
            });
        }

        const offData = await fetchFromOpenFoodFacts(barcode);

        if (!offData?.product) {
            return res.json({ found: false });
        }

        const p = offData.product;

        return res.json({
            found: true,
            source: "off_api",
            product: {
                barcode,
                name: p.product_name || "Unknown product",
                brand: p.brands || "",
                quantity: p.quantity || ""
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Barcode lookup failed" });
    }
}
