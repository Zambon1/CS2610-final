import express from "express";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  getInventoryItemById,
  updateInventoryItem,
} from "../models/inventory.js";
import { requireSupervisor } from "../middleware/auth.js";

const router = express.Router();

function parseQuantity(quantity) {
  const parsed = Number.parseInt(quantity, 10);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function validateInventoryPayload(req, res) {
  const { name, quantity, status } = req.body;
  const parsedQuantity = parseQuantity(quantity);

  if (!name || !name.trim()) {
    res.status(400).json({ error: "Item name is required." });
    return null;
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    res.status(400).json({ error: "Quantity must be a non-negative integer." });
    return null;
  }

  if (!status || !status.trim()) {
    res.status(400).json({ error: "Status is required." });
    return null;
  }

  return {
    name: name.trim(),
    quantity: parsedQuantity,
    status: status.trim(),
  };
}

router.get("/", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const items = await getInventory(search, status);
    res.json({ items });
  } catch (err) {
    console.error("Inventory list error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await getInventoryItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found." });
    }

    res.json({ item });
  } catch (err) {
    console.error("Inventory detail error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/", requireSupervisor, async (req, res) => {
  const payload = validateInventoryPayload(req, res);
  if (!payload) {
    return;
  }

  try {
    const item = await createInventoryItem(
      payload.name,
      payload.quantity,
      payload.status
    );
    res.status(201).json({ item });
  } catch (err) {
    console.error("Inventory create error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/:id", requireSupervisor, async (req, res) => {
  const payload = validateInventoryPayload(req, res);
  if (!payload) {
    return;
  }

  try {
    const item = await updateInventoryItem(
      req.params.id,
      payload.name,
      payload.quantity,
      payload.status
    );

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found." });
    }

    res.json({ item });
  } catch (err) {
    console.error("Inventory update error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

router.delete("/:id", requireSupervisor, async (req, res) => {
  try {
    const item = await getInventoryItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Inventory item not found." });
    }

    await deleteInventoryItem(req.params.id);
    res.json({ message: "Inventory item deleted." });
  } catch (err) {
    console.error("Inventory delete error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;