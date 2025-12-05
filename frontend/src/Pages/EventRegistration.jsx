import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/EventRegistration.css";

const EventRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    college: user?.college || "",
  });

  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5000/api/registrations/student/${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          const ids = (data.registrations || []).map(
            (r) => r.eventId?._id || r.eventId
          );
          setRegisteredEvents(ids);
        })
        .catch(() => setRegisteredEvents([]));
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user) {
      toast.warn("Please log in to continue!", { position: "top-center" });
      navigate("/login");
    }
  }, [user, navigate]);

  const isAlreadyRegistered = (eventId) =>
    registeredEvents.includes(eventId);

  if (!event) {
    return (
      <div className="er-registration-container">
        <div className="er-registration-card">
          <div style={{ padding: 24 }}>
            <h2>No event selected 😕</h2>
            <button
              onClick={() => navigate("/student-dashboard")}
              className="er-back-btn"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventId = event._id || event.id;
    if (!eventId || !formData.name || !formData.email || !formData.college) {
      toast.error("All fields are required!", { position: "top-center" });
      return;
    }

    if (isAlreadyRegistered(eventId)) {
      toast.warn("You have already registered for this event!", {
        position: "top-center",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name: formData.name,
          email: formData.email,
          college: formData.college,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "🎉 Registered successfully!", {
          position: "top-center",
          autoClose: 1400,
        });
        setTimeout(() => {
          navigate("/student-dashboard", { state: { justRegistered: true } });
        }, 1400);
      } else {
        toast.error(data.message || "Registration failed!", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Try again later!", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="er-registration-container">
      <ToastContainer />
      <div className="er-registration-card">
        {/* LEFT: Event preview */}
        <div className="er-event-preview">
          <img
            src={
              event.image ||
              "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
            }
            alt={event.title || "event"}
          />
          <h2>{event.title}</h2>
          <p className="er-college">{event.collegeName}</p>
          <p className="er-desc">{event.description}</p>

          <div className="er-event-meta">
            <p>📅 {event.date}</p>
            <p>🕒 {event.time}</p>
          </div>
        </div>

        {/* RIGHT: Registration form */}
        <form className="er-registration-form" onSubmit={handleSubmit}>
          <h3>Register for this Event</h3>

          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>College</label>
          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="er-submit-btn"
            disabled={isAlreadyRegistered(event._id)}
          >
            {isAlreadyRegistered(event._id) ? "Already Registered" : "Register Now"}
          </button>

          <button
            type="button"
            className="er-back-btn"
            onClick={() => navigate("/student-dashboard")}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRegistration;
