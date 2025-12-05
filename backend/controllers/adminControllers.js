import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Feedback from "../models/Feedback.js";

/* =================== DASHBOARD STATS =================== */
export const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: "Active" });
    const totalRegistrations = await Registration.countDocuments();
    const pendingApprovals = await Registration.countDocuments({ status: "Pending" });

    res.json({
      totalEvents,
      activeEvents,
      totalRegistrations,
      pendingApprovals,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =================== CRUD EVENTS =================== */
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =================== REGISTRATIONS =================== */
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate("eventId");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("eventId");

    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =================== FEEDBACK =================== */
// 🟢 CREATE OR ONE-TIME UPDATE FEEDBACK
export const submitFeedback = async (req, res) => {
  try {
    const { eventId, name, email, rating, comments } = req.body;
    const cleanedEmail = email.toLowerCase();

    let existing = await Feedback.findOne({ eventId, email: cleanedEmail });

    // 🔴 If feedback already exists AND edit already used
    if (existing && existing.editCount >= 1) {
      return res.status(403).json({
        success: false,
        message: "You already edited your feedback once. Further changes are not allowed."
      });
    }

    // 🔵 If feedback exists, update ONCE
    if (existing) {
      existing.rating = rating;
      existing.comments = comments;
      existing.editCount += 1; // 🟣 Increase edit count
      await existing.save();
      return res.json({ success: true, message: "Feedback updated successfully" });
    }

    // 🟢 Create new feedback
    await Feedback.create({
      eventId,
      name,
      email: cleanedEmail,
      rating,
      comments,
      editCount: 0
    });

    // Update student registration flag
    await Registration.updateOne(
      { eventId, studentEmail: cleanedEmail },
      { $set: { feedbackGiven: true } }
    );

    res.json({ success: true, message: "Feedback submitted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟡 CHECK IF FEEDBACK EXISTS (for frontend)
export const checkFeedback = async (req, res) => {
  try {
    const { eventId, email } = req.params;
    const cleanedEmail = email.toLowerCase();

    const feedback = await Feedback.findOne({ eventId, email: cleanedEmail });
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =================== ADMIN VIEW FEEDBACKS =================== */
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("eventId", "title");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =================== RECENT ACTIVITY =================== */
export const getRecentActivity = async (req, res) => {
  try {
    const recentEvents = await Event.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt");

    const formattedActivity = recentEvents.map((event) => ({
      eventName: event.title,
      action: "Event Created or Updated",
      timestamp: event.updatedAt,
    }));

    res.json(formattedActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
