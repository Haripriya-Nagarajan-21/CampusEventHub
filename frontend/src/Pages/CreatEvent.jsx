import React, { useState, useEffect } from "react";
import "../Styles/CreateEvent.css";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../config/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    category: "",
    venue: "",
    image: null,
  });

  const isEdit = location?.state?.isEdit || false;
  const editEvent = location?.state?.event || null;

  /* =========================
     PREFILL WHEN EDITING
  ========================= */
  useEffect(() => {
    if (isEdit && editEvent) {
      setEventData({
        title: editEvent.title || "",
        description: editEvent.description || "",
        date: editEvent.date
          ? new Date(editEvent.date).toISOString().slice(0, 10)
          : "",
        time: editEvent.time || "",
        category: editEvent.category || "",
        venue: editEvent.venue || "",
        image: null,
      });

      setPreview(editEvent.image || null);
    }
  }, [isEdit, editEvent]);

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setEventData({ ...eventData, image: file });

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    Object.keys(eventData).forEach((key) => {
      if (eventData[key]) {
        formData.append(key, eventData[key]);
      }
    });

    try {
      let res;

      if (isEdit && editEvent?._id) {
        res = await api.put(`/events/${editEvent._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post(`/events/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        isEdit ? "✅ Event updated!" : "🎉 Event created!",
        { autoClose: 1200 }
      );

      setTimeout(() => navigate("/admin"), 1200);
    } catch (error) {
      toast.error("❌ Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h1>{isEdit ? "Edit Event" : "Create New Event"}</h1>

      <form className="create-event-form" onSubmit={handleSubmit}>
        <label>Event Title</label>
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          rows="4"
          value={eventData.description}
          onChange={handleChange}
          required
        />

        <div className="form-row">
          <input type="date" name="date" value={eventData.date} onChange={handleChange} required />
          <input type="time" name="time" value={eventData.time} onChange={handleChange} required />
        </div>

        <label>Category</label>
        <select
          name="category"
          value={eventData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Technical">Technical</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Workshop">Workshop</option>
        </select>

        <label>Venue</label>
        <input
          type="text"
          name="venue"
          value={eventData.venue}
          onChange={handleChange}
          required
        />

        <label>Event Image</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} />

        {/* IMAGE PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: 200,
              marginTop: 10,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        )}

        <div className="button-group">
          <button
            type="submit"
            className={`create-btn ${loading ? "loading-btn" : ""}`}
            disabled={loading}
          >
            {loading ? "" : isEdit ? "Update Event" : "Create Event"}
          </button>

          <button
            type="button"
            className="cancel-btnc"
            onClick={() => navigate("/admin")}
          >
            Cancel
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default CreateEvent;
