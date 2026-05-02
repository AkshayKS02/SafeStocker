import crypto from "crypto";
import db from "../config/db.js";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createRandomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 900000000);
}

export function toAuthUser(user) {
  return {
    ShopID: user.ShopID,
    OwnerName: user.OwnerName,
    Email: user.Email
  };
}

export async function findOrCreateGoogleShop(profile) {
  const email = profile.emails[0].value;
  const name = profile.displayName;
  const picture = profile.photos?.[0]?.value || "";

  const result = await db.query(
    `SELECT "ShopID","OwnerName","Email"
     FROM shop
     WHERE "Email" = $1`,
    [email]
  );

  if (result.rows.length > 0) {
    return {
      ...result.rows[0],
      isNew: false,
      picture
    };
  }

  const insert = await db.query(
    `INSERT INTO shop ("OwnerName","Phone","Email")
     VALUES ($1,$2,$3)
     RETURNING *`,
    [name, createRandomPhone(), email]
  );

  return {
    ...insert.rows[0],
    isNew: true,
    picture
  };
}

export async function findShopByCredentials(email, password) {
  const result = await db.query(
    'SELECT "ShopID","OwnerName","Email","Password" FROM shop WHERE "Email" = $1',
    [email]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  return hashPassword(password) === user.Password ? toAuthUser(user) : null;
}

export async function createShopWithPassword({ OwnerName, Email, Password }) {
  const existing = await db.query(
    'SELECT "ShopID" FROM shop WHERE "Email" = $1',
    [Email]
  );

  if (existing.rows.length > 0) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const result = await db.query(
    'INSERT INTO shop ("OwnerName","Phone","Email","Password") VALUES ($1,$2,$3,$4) RETURNING "ShopID","OwnerName","Email"',
    [OwnerName, createRandomPhone(), Email, hashPassword(Password)]
  );

  return result.rows[0];
}
