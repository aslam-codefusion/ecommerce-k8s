const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { products } = require("./products");

const app = express();
const PORT = process.env.PORT || 3000;
const STORE_NAME = process.env.STORE_NAME || "Aslam Store";

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(morgan("combined"));

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "backend",
    time: new Date().toISOString()
  });
});

app.get("/products", (_req, res) => {
  res.json({
    storeName: STORE_NAME,
    products
  });
});

app.post("/orders", (req, res) => {
  const { customerName, email, items } = req.body || {};

  if (!customerName || !email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "customerName, email, and items are required"
    });
  }

  const orderId = `ORD-${Date.now()}`;

  return res.status(201).json({
    message: "Order created successfully",
    orderId,
    customerName,
    email,
    totalItems: items.length
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${STORE_NAME} backend running on port ${PORT}`);
});
