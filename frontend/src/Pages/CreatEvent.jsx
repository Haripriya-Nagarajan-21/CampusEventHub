import React, { useState, useEffect } from "react";
import "../Styles/CreateEvent.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    category: "",
    venue: "",
    image: null,
  });
  const location = useLocation();
  const isEdit = location?.state?.isEdit || false;
  const editEvent = location?.state?.event || null;

  useEffect(() => {
    if (isEdit && editEvent) {
      // Prefill form (image remains null unless user selects a new file)
      setEventData({
        title: editEvent.title || "",
        description: editEvent.description || "",
        date: editEvent.date ? new Date(editEvent.date).toISOString().slice(0, 10) : "",
        time: editEvent.time || "",
        category: editEvent.category || "",
        venue: editEvent.venue || "",
        image: null,
      });
    }
  }, [isEdit, editEvent]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setEventData({ ...eventData, image: files[0] });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    // append only non-null values; image may be null when editing
    if (eventData.title) formData.append("title", eventData.title);
    if (eventData.description) formData.append("description", eventData.description);
    if (eventData.date) formData.append("date", eventData.date);
    if (eventData.time) formData.append("time", eventData.time);
    if (eventData.category) formData.append("category", eventData.category);
    if (eventData.venue) formData.append("venue", eventData.venue);
    if (eventData.image) formData.append("image", eventData.image);

    try {
      let res;
      if (isEdit && editEvent && (editEvent._id || editEvent.id)) {
        const id = editEvent._id || editEvent.id;
        res = await axios.put(`http://localhost:5000/api/events/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post("http://localhost:5000/api/events/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data && (res.data.success || res.status === 200 || res.status === 201)) {
        toast.success(isEdit ? "✅ Event updated successfully!" : "🎉 Event created successfully!", {
          position: "top-center",
          autoClose: 1500,
          theme: "colored",
        });

        setTimeout(() => navigate("/admin"), 1200);
      } else {
        toast.error(isEdit ? "❌ Failed to update event!" : "❌ Failed to create event!", {
          position: "top-center",
          autoClose: 2500,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("⚠️ Something went wrong!", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h1>Create New Event</h1>
      <form className="create-event-form" onSubmit={handleSubmit}>
  <label>Event Title</label>
  <input type="text" name="title" placeholder="Enter event title" onChange={handleChange} value={eventData.title} required />

  <label>Description</label>
  <textarea name="description" placeholder="Enter event description" rows="4" onChange={handleChange} value={eventData.description} required />

        <div className="form-row">
          <div>
            <label>Date</label>
            <input type="date" name="date" onChange={handleChange} value={eventData.date} required />
          </div>
          <div>
            <label>Time</label>
            <input type="time" name="time" onChange={handleChange} value={eventData.time} required />
          </div>
        </div>

        <label>Category</label>
        <select name="category" onChange={handleChange} value={eventData.category} required>
          <option value="">Select Category</option>
          <option value="Technical">Technical</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Workshop">Workshop</option>
        </select>

  <label>Venue</label>
  <input type="text" name="venue" placeholder="Enter event venue" onChange={handleChange} value={eventData.venue} required />

        <label>Event Image {isEdit ? "(leave empty to keep existing)" : ""}</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} />

        {/* show preview when editing and there is an existing image */}
        {isEdit && editEvent?.image && (
          <div style={{ marginTop: 8 }}>
            <img src={editEvent.image} alt="current" style={{ maxWidth: 220, maxHeight: 120, objectFit: "cover", borderRadius: 6 }} />
          </div>
        )}

        <div className="button-group">
          <button type="submit" className="create-btn" disabled={loading}>
            {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Event" : "Create Event")}
          </button>
          <button type="button" className="cancel-btnc" onClick={() => navigate("/admin")}>
            Cancel
          </button>
        </div>
      </form>

      {/* ✅ Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CreateEvent;
