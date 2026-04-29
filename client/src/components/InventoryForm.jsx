function InventoryForm({
  name,
  setName,
  quantity,
  setQuantity,
  status,
  setStatus,
  onSubmit,
  submitLabel,
  error,
  loading,
  submitClassName = "",
}) {
  return (
    <form className="inventory-form" onSubmit={onSubmit}>
      {error && <p className="error-message">{error}</p>}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Item name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="available">Available</option>
            <option value="in use">In use</option>
            <option value="needs repair">Needs repair</option>
            <option value="under maintenance">Under maintenance</option>
          </select>
        </div>
      </div>
      <button type="submit" className={`btn btn-primary ${submitClassName}`.trim()} disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default InventoryForm;