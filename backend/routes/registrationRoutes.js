// @ts-nocheck
import express from "express";
import Registration from "../models/Registration.js";
import {
  registerForEvent,
  getAllRegistrations,
  getStudentRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from "../controllers/registrationController.js";

const router = express.Router();

// 🎓 Student routes
router.post("/", registerForEvent); // Register for an event
router.get("/", getAllRegistrations); // Get all registrations (admin)
router.get("/student/:email", getStudentRegistrations); // Get registrations for a student
router.delete("/:id", deleteRegistration);

// 🧑‍💼 Admin route (approve/reject registration)
router.put("/:id/status", updateRegistrationStatus);

// ✅ Get all pending registrations
router.get("/pending", async (req, res) => {
  try {
    const pending = await Registration.find({ status: "Pending" })
      .populate("eventId", "title") // populate the event title from Event model
      .sort({ createdAt: -1 });

    const formatted = pending.map((reg) => ({
      _id: reg._id,
      studentName: reg.studentName,
      studentEmail: reg.studentEmail,
      eventName: reg.eventId?.title || "Event", // use title from populated event
      timestamp: reg.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ Error fetching pending registrations:", error);
    res.status(500).json({ message: "Error fetching pending registrations" });
  }
});

// ✅ Get count of pending registrations (for admin notifications)
router.get("/pending/count", async (req, res) => {
  try {
    const count = await Registration.countDocuments({ status: "Pending" });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("❌ Error fetching pending count:", error);
    res.status(500).json({ success: false, message: "Error fetching pending count" });
  }
});

export default router;
