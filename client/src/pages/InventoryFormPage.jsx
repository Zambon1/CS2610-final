import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import InventoryForm from "../components/InventoryForm";

function InventoryFormPage() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState("available");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }

    if (!authLoading && user && !user.isSupervisor) {
      navigate("/inventory", { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity, status }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add inventory item.");
      }

      navigate("/inventory");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (authLoading) {
    return <p className="info-message">Checking permissions...</p>;
  }

  if (user && !user.isSupervisor) {
    return null;
  }

  return (
    <section className="inventory-page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Add a new item</h1>
          <p className="page-copy">Supervisors can register new equipment or supplies here.</p>
        </div>
      </div>

      <div className="detail-card">
        <InventoryForm
          name={name}
          setName={setName}
          quantity={quantity}
          setQuantity={setQuantity}
          status={status}
          setStatus={setStatus}
          onSubmit={handleSubmit}
          submitLabel="Create item"
          error={error}
          loading={loading}
        />
      </div>
    </section>
  );
}

export default InventoryFormPage;