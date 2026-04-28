import db from "../config/db.js";

export async function getDashboardOverview(req, res) {
  const ShopID = req.user?.ShopID;
  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  try {
    const products = await db.query(
      `SELECT COUNT(*) AS "totalProducts" FROM items WHERE "ShopID"=$1`,
      [ShopID]
    );

    const stock = await db.query(
      `SELECT COALESCE(SUM("Quantity"),0) AS "totalStockUnits" FROM stock WHERE "ShopID"=$1`,
      [ShopID]
    );

    const sales = await db.query(
      `SELECT COALESCE(SUM("TotalAmount"),0) AS "todaysSales"
       FROM billing
       WHERE "ShopID"=$1 AND DATE("BillDate") = CURRENT_DATE`,
      [ShopID]
    );

    const expiry = await db.query(
      `SELECT COUNT(*) AS "nearExpiry"
       FROM stock
       WHERE "ShopID"=$1
       AND "Quantity">0
       AND "ExpiryDate" > CURRENT_DATE
       AND "ExpiryDate" <= CURRENT_DATE + INTERVAL '7 days'`,
      [ShopID]
    );

    res.json({
      totalProducts: products.rows[0].totalProducts,
      totalStockUnits: stock.rows[0].totalStockUnits,
      todaysSales: sales.rows[0].todaysSales,
      nearExpiry: expiry.rows[0].nearExpiry
    });

  } catch (err) {
    res.status(500).json({ error: "Dashboard failed" });
  }
}

export async function getBiggestRevenueDays(req, res) {
  const ShopID = req.user?.ShopID;

  try {
    const result = await db.query(
      `SELECT 
        DATE("BillDate") AS day,
        SUM("TotalAmount") AS revenue
       FROM billing
       WHERE "ShopID"=$1
       AND DATE_TRUNC('month',"BillDate") = DATE_TRUNC('month',CURRENT_DATE)
       GROUP BY DATE("BillDate")
       ORDER BY revenue DESC
       LIMIT 5`,
      [ShopID]
    );

    res.json(result.rows);

  } catch {
    res.status(500).json({ error: "Failed revenue days" });
  }
}


export async function getRevenueGraph(req, res) {
  const ShopID = req.user?.ShopID;
  const { type } = req.query;

  try {
    let revenueQuery = "";
    let lossQuery = "";

    if (type === "hours") {
      revenueQuery = `
        SELECT EXTRACT(HOUR FROM "BillDate") AS label,
               SUM("TotalAmount") AS value
        FROM billing
        WHERE "ShopID"=$1 AND DATE("BillDate")=CURRENT_DATE
        GROUP BY label ORDER BY label`;

      lossQuery = `
        SELECT EXTRACT(HOUR FROM "LossDate") AS label,
               SUM("LossAmount") AS value
        FROM losses
        WHERE "ShopID"=$1 AND DATE("LossDate")=CURRENT_DATE
        GROUP BY label ORDER BY label`;
    }

    else if (type === "days") {
      revenueQuery = `
        SELECT EXTRACT(DAY FROM "BillDate") AS label,
               SUM("TotalAmount") AS value
        FROM billing
        WHERE "ShopID"=$1
        AND DATE_TRUNC('month',"BillDate")=DATE_TRUNC('month',CURRENT_DATE)
        GROUP BY label ORDER BY label`;

      lossQuery = `
        SELECT EXTRACT(DAY FROM "LossDate") AS label,
               SUM("LossAmount") AS value
        FROM losses
        WHERE "ShopID"=$1
        AND DATE_TRUNC('month',"LossDate")=DATE_TRUNC('month',CURRENT_DATE)
        GROUP BY label ORDER BY label`;
    }

    else {
      revenueQuery = `
        SELECT EXTRACT(MONTH FROM "BillDate") AS label,
               SUM("TotalAmount") AS value
        FROM billing
        WHERE "ShopID"=$1
        AND DATE_TRUNC('year',"BillDate")=DATE_TRUNC('year',CURRENT_DATE)
        GROUP BY label ORDER BY label`;

      lossQuery = `
        SELECT EXTRACT(MONTH FROM "LossDate") AS label,
               SUM("LossAmount") AS value
        FROM losses
        WHERE "ShopID"=$1
        AND DATE_TRUNC('year',"LossDate")=DATE_TRUNC('year',CURRENT_DATE)
        GROUP BY label ORDER BY label`;
    }

    const revenue = await db.query(revenueQuery, [ShopID]);
    const loss = await db.query(lossQuery, [ShopID]);

    res.json({
      revenue: revenue.rows,
      loss: loss.rows
    });

  } catch (err) {
    res.status(500).json({ error: "Graph failed" });
  }
}

export async function getRecentOrders(req, res) {
  const ShopID = req.user?.ShopID;

  if (!ShopID) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await db.query(
      `SELECT "ReceiptID","BillDate","TotalAmount"
       FROM billing
       WHERE "ShopID" = $1
       ORDER BY "BillDate" DESC
       LIMIT 10`,
      [ShopID]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
}