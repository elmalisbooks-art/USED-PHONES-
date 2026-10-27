const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL. Add your PostgreSQL Internal Database URL in Render > backend service > Environment.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS phones (
      id BIGSERIAL PRIMARY KEY,
      brand VARCHAR(80) NOT NULL,
      model VARCHAR(120) NOT NULL,
      price_ksh NUMERIC(12,2) NOT NULL CHECK (price_ksh > 0),
      condition VARCHAR(40) NOT NULL DEFAULT 'Used',
      storage VARCHAR(40),
      location VARCHAR(120),
      seller_name VARCHAR(120),
      whatsapp VARCHAR(40),
      description TEXT,
      photo_url TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS phones_created_at_idx ON phones (created_at DESC)");
  await pool.query("CREATE INDEX IF NOT EXISTS phones_brand_idx ON phones (brand)");
}

app.get("/", (req, res) => res.json({
  message: "PhoneMarket KE backend is running",
  database: "PostgreSQL configured",
  endpoints: ["GET /api/phones", "POST /api/phones", "GET /health"]
}));

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.get("/api/phones", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, brand, model, price_ksh AS price, condition, storage,
             location, seller_name AS seller, whatsapp, description,
             photo_url, status, created_at AS "createdAt"
      FROM phones WHERE status = 'active' ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Could not load phones:", error.message);
    res.status(500).json({ error: "Could not load phone listings." });
  }
});

app.post("/api/phones", async (req, res) => {
  const body = req.body || {};
  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const model = typeof body.model === "string" ? body.model.trim() : "";
  const price = Number(body.price);
  if (!brand || !model || body.price === undefined || body.price === null ||
      body.price === "" || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "Brand, model, and a price greater than zero are required." });
  }

  const clean = (value, max = 1000) =>
    typeof value === "string" ? value.trim().slice(0, max) : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO phones
        (brand, model, price_ksh, condition, storage, location, seller_name, whatsapp, description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, brand, model, price_ksh AS price, condition, storage,
                 location, seller_name AS seller, whatsapp, description,
                 photo_url, status, created_at AS "createdAt"`,
      [
        brand.slice(0, 80), model.slice(0, 120), price,
        clean(body.condition, 40) || "Used", clean(body.storage, 40),
        clean(body.location, 120), clean(body.seller || body.seller_name, 120),
        clean(body.whatsapp, 40), clean(body.description, 3000),
        clean(body.photo_url, 2000)
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Could not save phone:", error.message);
    res.status(500).json({ error: "Could not save phone listing." });
  }
});

app.use((req, res) => res.status(404).json({ error: "Endpoint not found." }));

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`PhoneMarket KE backend listening on port ${PORT}`);
      console.log("PostgreSQL table 'phones' is ready.");
    });
  } catch (error) {
    console.error("Could not initialize PostgreSQL:", error.message);
    process.exit(1);
  }
}
start();
