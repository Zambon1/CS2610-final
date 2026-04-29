import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useRequireUser } from "../hooks/useRequireUser";
import InventoryForm from "../components/InventoryForm";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString();
}

function InventoryDetail() {
  const { id } = useParams();
  const user = useRequireUser();
  const [item, setItem] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("available");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadItem() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/inventory/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load inventory item.");
        }

        setItem(data.item);
        setName(data.item.name);
        setQuantity(String(data.item.quantity));
        setStatus(data.item.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id, user]);

  if (!user) {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, status }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update inventory item.");
      }

      setItem(data.item);
      setQuantity(String(data.item.quantity));
      setStatus(data.item.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this inventory item?");
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete inventory item.");
      }

      navigate("/inventory");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="info-message">Loading inventory item...</p>;
  }

  if (error && !item) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <section className="inventory-detail">
      <Link to="/inventory" className="back-link">
        Back to inventory
      </Link>
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <p className="eyebrow">Inventory item</p>
            <h1>{item.name}</h1>
            <p className="page-copy">Added {formatDate(item.created_at)}</p>
          </div>
          <span className={`status-pill status-${item.status.replace(/\s+/g, "-")}`}>
            {item.status}
          </span>
        </div>

        <div className="detail-grid">
          <div>
            <span className="detail-label">Quantity</span>
            <strong>{item.quantity}</strong>
          </div>
          <div>
            <span className="detail-label">Date added</span>
            <strong>{formatDate(item.created_at)}</strong>
          </div>
          <div>
            <span className="detail-label">Status</span>
            <strong>{item.status}</strong>
          </div>
        </div>
      </div>

      {user.isSupervisor ? (
        <div className="detail-card">
          <div className="section-heading">
            <h2>Edit item</h2>
          </div>
          <InventoryForm
            name={name}
            setName={setName}
            quantity={quantity}
            setQuantity={setQuantity}
            status={status}
            setStatus={setStatus}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            submitClassName="inventory-save-button"
            error={error}
            loading={saving}
          />
          <button className="btn btn-danger inventory-delete-button" onClick={handleDelete} disabled={saving}>
            Delete item
          </button>
        </div>
      ) : (
        <p className="info-message">Sign in as a supervisor to edit or delete this item.</p>
      )}
    </section>
  );
}

export default InventoryDetail;