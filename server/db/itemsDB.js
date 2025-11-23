import fs from "fs";
import path from "path";

const itemsPath = path.join(process.cwd(), "items.json");

// Create empty file if not exist
if (!fs.existsSync(itemsPath)) {
    fs.writeFileSync(itemsPath, JSON.stringify([], null, 2));
}

export function loadItems() {
    return JSON.parse(fs.readFileSync(itemsPath, "utf8"));
}

export function saveItems(data) {
    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
}
