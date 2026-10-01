
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/orders";

const emptyForm = {
  customer: "",
  kilos: "",
  service_type: "Wash & Fold",
  date_received: new Date().toLocaleDateString("en-CA"),
  status: "Pending"
};

function App() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load orders from the backend
  async function loadOrders() {
    try {
      setLoading(true);
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to load orders.");
      }

      const data = await response.json();
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Handle form changes
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // Add or update an order
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editId ? `${API}/${editId}` : API,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setMessage(data.message);
      setForm(emptyForm);
      setEditId(null);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  // Fill the form for editing
  function handleEdit(order) {
    setEditId(order.id);
    setForm({
      customer: order.customer,
      kilos: String(order.kilos),
      service_type: order.service_type,
      date_received: String(order.date_received).slice(0, 10),
      status: order.status
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete an order
  async function handleDelete(id) {
    if (!window.confirm("Delete this laundry order?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed.");
      }

      setMessage(data.message);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  const pending = orders.filter(
    (o) => o.status === "Pending"
  ).length;

  const processing = orders.filter(
    (o) => o.status === "Processing"
  ).length;

  const completed = orders.filter(
    (o) => o.status === "Completed"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🧺 Laundry Tracker</h1>
          <p>Laundry Job Order Management System</p>
        </div>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat-card">
            <span>Total Orders</span>
            <h2>{orders.length}</h2>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <h2>{pending}</h2>
          </div>
          <div className="stat-card">
            <span>Processing</span>
            <h2>{processing}</h2>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <h2>{completed}</h2>
          </div>
        </section>

        <section className="panel">
          <h2>
            {editId ? "✏️ Edit Order" : "➕ New Laundry Order"}
          </h2>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Customer Name
                <input
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Kilos (kg)
                <input
                  type="number"
                  name="kilos"
                  value={form.kilos}
                  onChange={handleChange}
                  placeholder="Enter kilos"
                  min="0.01"
                  max="999.99"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Service Type
                <select
                  name="service_type"
                  value={form.service_type}
                  onChange={handleChange}
                >
                  <option>Wash &amp; Fold</option>
                  <option>Wash Only</option>
                  <option>Dry Cleaning</option>
                </select>
              </label>

              <label>
                Date Received
                <input
                  type="date"
                  name="date_received"
                  value={form.date_received}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Completed</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                {editId ? "Update Order" : "Add Order"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>📋 Laundry Orders</h2>

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="empty">No laundry orders yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Kilos</th>
                    <th>Service</th>
                    <th>Date Received</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.kilos} kg</td>
                      <td>{order.service_type}</td>
                      <td>
                        {String(order.date_received).slice(0, 10)}
                      </td>
                      <td>
                        <span
                          className={`badge ${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit"
                            onClick={() => handleEdit(order)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete"
                            onClick={() => handleDelete(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;