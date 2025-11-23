import { loadItems } from "../db/itemsDB.js";

export function getAllItems(req, res) {
    try {
        const items = loadItems();
        res.json(items);
    } catch (err) {
        console.error("Error loading items:", err);
        res.status(500).json({ error: "Could not load items" });
    }
}
