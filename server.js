const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary starter setup: allows your Render website to call this API.
// We will connect PostgreSQL in the next step.
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Temporary memory storage. Listings reset if the server restarts.
// PostgreSQL will replace this array in the database step.
let phones = [];
let nextId = 1;

app.get("/", (req, res) => {
  res.json({
    message: "PhoneMarket KE backend is running",
    endpoints: ["/api/phones", "/health"]
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/phones", (req, res) => {
  res.json(phones);
});

app.post("/api/phones", (req, res) => {
  const {
    brand, model, price, condition, storage,
    location, seller, whatsapp, description
  } = req.body || {};

  if (!brand || !model || price === undefined || price === null || price === "") {
    return res.status(400).json({
      error: "Please provide brand, model, and price."
    });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: "Price must be a number greater than 0." });
  }

  const phone = {
    id: nextId++,
    brand: String(brand).trim(),
    model: String(model).trim(),
    price: numericPrice,
    condition: condition ? String(condition).trim() : "Used",
    storage: storage ? String(storage).trim() : "",
    location: location ? String(location).trim() : "",
    seller: seller ? String(seller).trim() : "",
    whatsapp: whatsapp ? String(whatsapp).trim() : "",
    description: description ? String(description).trim() : "",
    createdAt: new Date().toISOString()
  };

  phones.unshift(phone);
  res.status(201).json(phone);
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PhoneMarket KE backend listening on port ${PORT}`);
});
