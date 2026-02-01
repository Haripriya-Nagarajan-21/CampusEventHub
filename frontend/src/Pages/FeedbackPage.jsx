// src/Pages/FeedbackPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar } from "react-icons/fa";
import "../Styles/Feedback.css";
import api from "../config/axios"; // ✅ ONLY ADDED

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || "",
    email: user?.email || "",
    rating: 0,
    comments: "",
    _id: null,
  });

  const lockKey = `fb_lock_${eventId}_${user?.email}`;

  /* =========== FETCH EVENT (axios only) =========== */
  useEffect(() => {
    if (!user) return navigate("/login");

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`); // ✅ axios
        setEvent(res.data.event || res.data);
      } catch {
        toast.error("Event not found ⚠️");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate, user]);

  /* =========== LOAD FEEDBACK & LOCK (axios only) =========== */
  useEffect(() => {
    if (!user?.email || !eventId) return;

    if (localStorage.getItem(lockKey) === "true") setIsLocked(true);

    const loadFeedback = async () => {
      try {
        const res = await api.get("/feedback"); // ✅ axios
        const data = res.data;

        if (data.success) {
          const existing = data.feedbacks.find(
            (fb) => fb.eventId?._id === eventId && fb.email === user.email
          );

          if (existing) {
            setFormData({
              name: existing.name,
              email: existing.email,
              rating: existing.rating,
              comments: existing.comments,
              _id: existing._id,
            });
          }
        }
      } catch {}
    };

    loadFeedback();
  }, [eventId, user?.email]);

  /* =========== SUBMIT FEEDBACK (axios only) =========== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!formData.rating || !formData.comments.trim()) {
      return toast.error("Rating & comments required!");
    }

    try {
      const res = await api.post("/feedback", { // ✅ axios
        ...formData,
        eventId,
      });

      const data = res.data;

      if (data.success) {
        if (!formData._id) {
          toast.success("🎉 Feedback Submitted!", { autoClose: 1400 });
        } else {
          toast.success("✏️ Feedback Updated!", { autoClose: 1400 });
          localStorage.setItem(lockKey, "true");
          setIsLocked(true);
        }

        setShowThankYou(true);

        setTimeout(() => {
          navigate("/student/registrations");
        }, 1400);
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* ======== UI BELOW NOT MODIFIED ======== */

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading…</h3>;

  if (!event)
    return (
      <div className="feedback-wrapper">
        <h3>Event not found</h3>
        <button className="back-btn" onClick={() => navigate("/student/registrations")}>
          Back
        </button>
      </div>
    );

  return (
    <div className="feedback-wrapper">
      <ToastContainer />

      {showThankYou && (
        <div className="thank-you-overlay">
          <div className="thank-you-card">
            <h2>🎉 Thank You!</h2>
            <p>Your feedback has been recorded successfully.</p>
          </div>
        </div>
      )}

      <div className="feedback-card-container">
        <div className="feedback-left">
          <img
            src={
              event.image ||
              "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
            }
            alt="Event"
          />
          <h2>{event.title}</h2>
          {event.description && <p>{event.description}</p>}
          <div className="meta">
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span>🕒 {event.time}</span>
          </div>
        </div>

        <form className="feedback-right" onSubmit={handleSubmit}>
          <h3>
            {isLocked
              ? "Feedback Locked"
              : formData._id
              ? "Edit Feedback (Only Once)"
              : "Submit Feedback"}
          </h3>

          <label>Name</label>
          <input readOnly value={formData.name} />

          <label>Email</label>
          <input readOnly value={formData.email} />

          <label>Rating</label>
          <div className="star-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                onClick={() => !isLocked && setFormData({ ...formData, rating: s })}
                color={s <= formData.rating ? "#f59e0b" : "#ddd"}
                style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
              />
            ))}
          </div>

          <label>Comments</label>
          <textarea
            readOnly={isLocked}
            value={formData.comments}
            onChange={(e) =>
              !isLocked && setFormData({ ...formData, comments: e.target.value })
            }
            rows={5}
          ></textarea>

          <button disabled={isLocked} className="submit-btn">
            {isLocked ? "Locked" : formData._id ? "Save Edit" : "Submit Feedback"}
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/student/registrations")}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
