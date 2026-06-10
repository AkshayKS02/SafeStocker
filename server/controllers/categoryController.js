import db from "../config/db.js";

export async function getAllCategories(req, res) {
  try {
    const result = await db.query(
      `SELECT "CategoryID", "CategoryName"
       FROM category
       ORDER BY "CategoryName" ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Categories fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}
