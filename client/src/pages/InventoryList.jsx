import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useRequireUser } from "../hooks/useRequireUser";

const statusOptions = ["", "available", "in use", "needs repair", "under maintenance"];

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString();
}

function InventoryList() {
  const user = useRequireUser();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (search.trim()) {
          params.set("search", search.trim());
        }
        if (status) {
          params.set("status", status);
        }

        const res = await fetch(`/api/inventory?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load inventory.");
        }

        setItems(data.items || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadItems();
    return () => controller.abort();
  }, [search, status, user]);

  if (!user) {
    return null;
  }

  return (
    <section className="inventory-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>All equipment and supplies</h1>
          <p className="page-copy">
            Search by name or narrow the list by status. Supervisors can add and edit items.
          </p>
        </div>
        {user?.isSupervisor && (
          <button className="btn btn-primary" onClick={() => navigate("/inventory/new")}>Add item</button>
        )}
      </div>

      <div className="inventory-filters">
        <div className="form-group inventory-search">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search inventory"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="form-group inventory-status-filter">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            {statusOptions
              .filter(Boolean)
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="table-shell">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Date added</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  No inventory items found.
                </td>
              </tr>
            ) : null}
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/inventory/${item.id}`}>{item.name}</Link>
                </td>
                <td>{item.quantity}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  <span className={`status-pill status-${item.status.replace(/\s+/g, "-")}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="info-message">Loading inventory...</p>}
    </section>
  );
}

export default InventoryList;