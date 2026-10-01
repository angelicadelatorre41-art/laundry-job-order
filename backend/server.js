const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Laundry Job Order API is running!"
  });
});

// ==========================================
// GET - View all laundry orders
// ==========================================
app.get("/api/orders", (req, res) => {
  const sql = `
    SELECT *
    FROM laundry_orders
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to get laundry orders"
      });
    }

    res.json(results);
  });
});

// ==========================================
// POST - Add new laundry order
// ==========================================
app.post("/api/orders", (req, res) => {
  const {
    customer,
    kilos,
    service_type,
    date_received,
    status
  } = req.body;

  // Basic validation
  if (
    !customer ||
    !kilos ||
    !service_type ||
    !date_received ||
    !status
  ) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  if (Number(kilos) <= 0) {
    return res.status(400).json({
      error: "Kilos must be greater than 0"
    });
  }

  const sql = `
    INSERT INTO laundry_orders
    (customer, kilos, service_type, date_received, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      customer,
      Number(kilos),
      service_type,
      date_received,
      status
    ],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Failed to add order"
        });
      }

      res.status(201).json({
        message: "Laundry order added successfully!",
        id: result.insertId
      });
    }
  );
});

// ==========================================
// PUT - Update laundry order
// ==========================================
app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  const {
    customer,
    kilos,
    service_type,
    date_received,
    status
  } = req.body;

  if (
    !customer ||
    !kilos ||
    !service_type ||
    !date_received ||
    !status
  ) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  const sql = `
    UPDATE laundry_orders
    SET
      customer = ?,
      kilos = ?,
      service_type = ?,
      date_received = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      customer,
      Number(kilos),
      service_type,
      date_received,
      status,
      id
    ],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          error: "Failed to update order"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Order not found"
        });
      }

      res.json({
        message: "Laundry order updated successfully!"
      });
    }
  );
});

// ==========================================
// DELETE - Delete laundry order
// ==========================================
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM laundry_orders
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to delete order"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    res.json({
      message: "Laundry order deleted successfully!"
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});