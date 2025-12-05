import Event from "../models/Event.js";

// ✅ Create Event with Image Upload (Cloudinary)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, category, venue } = req.body;
    const image = req.file?.path || ""; // Cloudinary automatically provides hosted image URL

    const event = new Event({
      title,
      description,
      date,
      time,
      category,
      venue,
      image,
    });

    await event.save();
    res
      .status(201)
      .json({ success: true, message: "Event created successfully", event });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating event",
        error: error.message,
      });
  }
};

// ✅ Get All Events (for Student Dashboard)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// ✅ Get Event Stats (for Admin Dashboard)
export const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const categories = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.status(200).json({ totalEvents, categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message,
    });
  }
};

// ✅ Update Event (Admin)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const { title, description, date, time, category, venue } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (category) event.category = category;
    if (venue) event.venue = venue;

    const image = req.file?.path;
    if (image) event.image = image;

    await event.save();
    res.status(200).json({ success: true, message: "Event updated successfully", event });
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({ success: false, message: "Error updating event", error: error.message });
  }
};

// ✅ Delete Event (Admin)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Note: cloudinary cleanup could be added here if desired
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ success: false, message: "Error deleting event", error: error.message });
  }
};
