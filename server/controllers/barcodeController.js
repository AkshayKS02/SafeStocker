import { fetchFromOpenFoodFacts } from "../services/offAPI.js";

export async function handleBarcode(req, res) {
    const { barcode } = req.body;

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
            package_quantity: p.quantity || "",
            image: p.image_url || ""
        };

        // DO NOT SAVE HERE
        return res.json({ found: true, product });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

