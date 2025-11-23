import { fetchFromOpenFoodFacts } from "../services/offAPI.js";
import { loadItems, saveItems } from "../db/itemsDB.js";

export async function handleBarcode(req, res) {
    const { barcode, quantity } = req.body;

    if (!barcode)
        return res.status(400).json({ error: "barcode missing" });

    try {
        const offData = await fetchFromOpenFoodFacts(barcode);

        if (!offData.product)
            return res.json({ found: false });

        const p = offData.product;

        const product = {
            barcode,
            name: p.product_name || "Unknown",
            brand: p.brands || "Unknown",
            quantity: quantity || 1,
            package_quantity: p.quantity || "",
            shelf_life: p.expiration_date || "Unknown",
            timestamp: Date.now()
        };

        const items = loadItems();
        items.push(product);
        saveItems(items);

        res.json({ found: true, product });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}
