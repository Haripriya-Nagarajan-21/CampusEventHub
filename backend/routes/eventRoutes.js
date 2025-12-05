import express from "express";
import upload from "../middleware/upload.js";
import Event from "../models/Event.js"; // Add this
import { createEvent, getAllEvents, getEventStats, updateEvent, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();

// Create Event (Admin) — with Image Upload
router.post("/create", upload.single("image"), createEvent);

// Get All Events (Student Dashboard)
router.get("/all", getAllEvents);

// Get Event Stats (Admin Dashboard)
router.get("/stats", getEventStats);

// Update event (with optional image)
router.put("/:id", upload.single("image"), updateEvent);

// Delete event
router.delete("/:id", deleteEvent);

// ✅ Get Single Event by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
