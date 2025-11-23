import { loadItems, saveItems } from "../db/itemsDB.js";

// GET /items
export function getAllItems(req, res) {
    try {
        const items = loadItems();
        res.json(items);
    } catch (err) {
        console.error("Error loading items:", err);
        res.status(500).json({ error: "Could not load items" });
    }
}

// POST /items/add
export function saveNewItem(req, res) {
    try {
        const item = req.body;

        if (!item || !item.barcode) {
            return res.status(400).json({ error: "Invalid item data" });
        }

        const items = loadItems();

        items.push({
            ...item,
            timestamp: Date.now()  // Add timestamp automatically
        });

        saveItems(items);

        res.json({ success: true, item });
    } catch (err) {
        console.error("Error saving item:", err);
        res.status(500).json({ error: "Could not save item" });
    }
}

