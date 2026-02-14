import db from "../config/db.js";

export async function getDashboardOverview(req, res) {
  const ShopID = req.user?.ShopID;

  if (!ShopID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    // Total Products
    const [[products]] = await db.query(
      `SELECT COUNT(*) AS totalProducts
       FROM items
       WHERE ShopID = ?`,
      [ShopID]
    );

    // Total Stock Units
    const [[stock]] = await db.query(
      `SELECT SUM(Quantity) AS totalStockUnits
       FROM stock
       WHERE ShopID = ?`,
      [ShopID]
    );

    // Today's Sales
    const [[sales]] = await db.query(
      `SELECT SUM(TotalAmount) AS todaysSales
       FROM billing
       WHERE ShopID = ?
       AND DATE(BillDate) = CURDATE()`,
      [ShopID]
    );

    // Near Expiry (Orange items = next 7 days but not expired)
    const [[expiry]] = await db.query(
      `
      SELECT COUNT(*) AS nearExpiry
      FROM stock
      WHERE ShopID = ?
      AND Quantity > 0
      AND ExpiryDate > CURDATE()
      AND ExpiryDate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      `,
      [ShopID]
    );

    res.json({
      totalProducts: products.totalProducts || 0,
      totalStockUnits: stock.totalStockUnits || 0,
      todaysSales: sales.todaysSales || 0,
      nearExpiry: expiry.nearExpiry || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard overview" });
  }
}

export async function getBiggestRevenueDays(req, res) {
  const ShopID = req.user?.ShopID;

  if (!ShopID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const [rows] = await db.query(
      `
      SELECT 
        DATE(BillDate) AS day,
        SUM(TotalAmount) AS revenue
      FROM billing
      WHERE ShopID = ?
      AND MONTH(BillDate) = MONTH(CURDATE())
      AND YEAR(BillDate) = YEAR(CURDATE())
      GROUP BY DATE(BillDate)
      ORDER BY revenue DESC
      LIMIT 5
      `,
      [ShopID]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch biggest revenue days" });
  }
}

export async function getRecentOrders(req, res) {
  const ShopID = req.user?.ShopID;

  if (!ShopID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [orders] = await db.query(
      `
      SELECT ReceiptID, BillDate, TotalAmount
      FROM billing
      WHERE ShopID = ?
      ORDER BY BillDate DESC
      LIMIT 10
      `,
      [ShopID]
    );

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
}

export async function getRevenueGraph(req, res) {
  const ShopID = req.user?.ShopID;
  const { type } = req.query;

  if (!ShopID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    let revenueQuery = "";
    let lossQuery = "";
    let labelName = "";

    if (type === "hours") {

      revenueQuery = `
        SELECT HOUR(BillDate) AS label,
               SUM(TotalAmount) AS value
        FROM billing
        WHERE ShopID = ?
        AND DATE(BillDate) = CURDATE()
        GROUP BY HOUR(BillDate)
        ORDER BY HOUR(BillDate)
      `;

      lossQuery = `
        SELECT HOUR(LossDate) AS label,
               SUM(LossAmount) AS value
        FROM losses
        WHERE ShopID = ?
        AND DATE(LossDate) = CURDATE()
        GROUP BY HOUR(LossDate)
        ORDER BY HOUR(LossDate)
      `;

      labelName = "Hourly Performance";
    }

    else if (type === "days") {

      revenueQuery = `
        SELECT DAY(BillDate) AS label,
               SUM(TotalAmount) AS value
        FROM billing
        WHERE ShopID = ?
        AND MONTH(BillDate) = MONTH(CURDATE())
        AND YEAR(BillDate) = YEAR(CURDATE())
        GROUP BY DAY(BillDate)
        ORDER BY DAY(BillDate)
      `;

      lossQuery = `
        SELECT DAY(LossDate) AS label,
               SUM(LossAmount) AS value
        FROM losses
        WHERE ShopID = ?
        AND MONTH(LossDate) = MONTH(CURDATE())
        AND YEAR(LossDate) = YEAR(CURDATE())
        GROUP BY DAY(LossDate)
        ORDER BY DAY(LossDate)
      `;

      labelName = "Daily Performance";
    }

    else { // months

      revenueQuery = `
        SELECT MONTH(BillDate) AS label,
               SUM(TotalAmount) AS value
        FROM billing
        WHERE ShopID = ?
        AND YEAR(BillDate) = YEAR(CURDATE())
        GROUP BY MONTH(BillDate)
        ORDER BY MONTH(BillDate)
      `;

      lossQuery = `
        SELECT MONTH(LossDate) AS label,
               SUM(LossAmount) AS value
        FROM losses
        WHERE ShopID = ?
        AND YEAR(LossDate) = YEAR(CURDATE())
        GROUP BY MONTH(LossDate)
        ORDER BY MONTH(LossDate)
      `;

      labelName = "Monthly Performance";
    }

    const [revenueRows] = await db.query(revenueQuery, [ShopID]);
    const [lossRows] = await db.query(lossQuery, [ShopID]);

    res.json({
      label: labelName,
      revenue: revenueRows,
      loss: lossRows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load graph data" });
  }
}

