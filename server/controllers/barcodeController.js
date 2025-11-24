import { fetchFromOpenFoodFacts } from "../services/offAPI.js";

let lastScan = null;

// Handle POST /barcode from Python
export async function handleBarcode(req, res) {
  const { barcode } = req.body;

  if (!barcode) return res.status(400).json({ error: "barcode missing" });

  try {
    const offData = await fetchFromOpenFoodFacts(barcode);

    if (!offData.product) {
      lastScan = { product: null };   // store failure
      return res.json({ found: false });
    }

    const p = offData.product;

    const product = {
      barcode,
      name: p.product_name || "Unknown",
      brand: p.brands || "Unknown",
      package_quantity: p.quantity || "",
    };

    lastScan = { product };   // store latest scan result

    return res.json({ found: true, product });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Handle GET /barcode/latest for frontend polling
export function getLatestScan(req, res) {
  res.json(lastScan || {});
}
