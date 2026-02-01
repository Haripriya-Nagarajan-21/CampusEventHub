// src/Pages/FeedbackPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaStar } from "react-icons/fa";
import "../Styles/Feedback.css";
import api from "../config/axios"; // ✅ IMPORTANT

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

  /* =====================================================
     ✅ FETCH EVENT (FIXED)
  ===================================================== */
  useEffect(() => {
    if (!user) return navigate("/login");

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`);
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

  /* =====================================================
     ✅ LOAD EXISTING FEEDBACK (FIXED)
  ===================================================== */
  useEffect(() => {
    if (!user?.email || !eventId) return;

    if (localStorage.getItem(lockKey) === "true") setIsLocked(true);

    const loadFeedback = async () => {
      try {
        const res = await api.get("/feedback");
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

  /* =====================================================
     ✅ SUBMIT FEEDBACK (FIXED)
  ===================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!formData.rating || !formData.comments.trim()) {
      return toast.error("Rating & comments required!");
    }

    try {
      const res = await api.post("/feedback", {
        ...formData,
        eventId,
      });

      const data = res.data;

      if (data.success) {
        toast.success(
          formData._id ? "✏️ Feedback Updated!" : "🎉 Feedback Submitted!"
        );

        if (formData._id) {
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

  /* ===================================================== */

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading…</h3>;

  if (!event)
    return (
      <div className="feedback-wrapper">
        <h3>Event not found</h3>
        <button onClick={() => navigate("/student/registrations")}>
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
        {/* LEFT */}
        <div className="feedback-left">
          <img
            src={
              event.image ||
              "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
            }
            alt="Event"
          />
          <h2>{event.title}</h2>
          <p>{event.description}</p>
        </div>

        {/* RIGHT */}
        <form className="feedback-right" onSubmit={handleSubmit}>
          <h3>
            {isLocked
              ? "Feedback Locked"
              : formData._id
              ? "Edit Feedback"
              : "Submit Feedback"}
          </h3>

          <input readOnly value={formData.name} />
          <input readOnly value={formData.email} />

          <div className="star-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                onClick={() =>
                  !isLocked && setFormData({ ...formData, rating: s })
                }
                color={s <= formData.rating ? "#f59e0b" : "#ddd"}
              />
            ))}
          </div>

          <textarea
            readOnly={isLocked}
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
          />

          <button disabled={isLocked}>
            {isLocked ? "Locked" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
