import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "../Styles/EventRegistration.css";
import api from "../config/axios"; // ✅ USE AXIOS

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

  /* ==============================
     ✅ GET REGISTERED EVENTS
  ============================== */
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user?.email) return;

      try {
        const res = await api.get(`/registrations/student/${user.email}`); // ✅ fixed
        const ids = (res.data.registrations || []).map(
          (r) => r.eventId?._id || r.eventId
        );
        setRegisteredEvents(ids);
      } catch {
        setRegisteredEvents([]);
      }
    };

    fetchRegistrations();
  }, [user?.email]);

  /* ==============================
     LOGIN CHECK
  ============================== */
  useEffect(() => {
    if (!user) {
      toast.warn("Please log in to continue!");
      navigate("/login");
    }
  }, [user, navigate]);

  const isAlreadyRegistered = (eventId) =>
    registeredEvents.includes(eventId);

  if (!event) {
    return (
      <div className="er-registration-container">
        <h2>No event selected 😕</h2>
        <button onClick={() => navigate("/student-dashboard")}>
          Back
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ==============================
     ✅ REGISTER USING API
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventId = event._id || event.id;

    if (!eventId || !formData.name || !formData.email || !formData.college) {
      toast.error("All fields are required!");
      return;
    }

    if (isAlreadyRegistered(eventId)) {
      toast.warn("Already registered!");
      return;
    }

    try {
      const res = await api.post("/registrations", {
        eventId,
        name: formData.name,
        email: formData.email,
        college: formData.college,
      });

      if (res.data.success) {
        toast.success("🎉 Registered successfully!");

        setTimeout(() => {
          navigate("/student-dashboard", {
            state: { justRegistered: true },
          });
        }, 1200);
      } else {
        toast.error(res.data.message || "Registration failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error!");
    }
  };

  return (
    <div className="er-registration-container">
      <ToastContainer />

      <div className="er-registration-card">
        {/* Event Preview */}
        <div className="er-event-preview">
          <img
            src={
              event.image ||
              "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
            }
            alt={event.title}
          />

          <h2>{event.title}</h2>
          <p>{event.description}</p>
          <p>📅 {event.date}</p>
          <p>🕒 {event.time}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />

          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleChange}
            placeholder="College"
            required
          />

          <button
            type="submit"
            disabled={isAlreadyRegistered(event._id)}
          >
            {isAlreadyRegistered(event._id)
              ? "Already Registered"
              : "Register Now"}
          </button>

          <button
            type="button"
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
