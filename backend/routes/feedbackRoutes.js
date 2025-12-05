import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// ➕ Submit Feedback / Comment
router.post("/", async (req, res) => {
  try {
    const { eventId, name, email, rating, comments } = req.body;

    // ✅ Validate input
    if (!eventId || !name || !email || !rating || !comments) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // ✅ Create and save feedback
    const newFeedback = new Feedback({ eventId, name, email, rating, comments });
    await newFeedback.save();

    res.status(200).json({ success: true, message: "Feedback submitted!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ success: false, message: "Error saving feedback" });
  }
});

// 📄 Get All Feedback (Admin)
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("eventId", "title")
      .sort({ createdAt: -1 }); // newest first
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Error fetching feedback" });
  }
});

// ❌ Delete Feedback / Comment
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    res.status(200).json({ success: true, message: "Feedback deleted!" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: "Error deleting feedback" });
  }
});

export default router;
