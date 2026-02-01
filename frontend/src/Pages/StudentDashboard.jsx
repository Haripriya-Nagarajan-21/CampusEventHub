// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import "../Styles/StudentDashboard.css";
import {
  FaClock,
  FaCheckCircle
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import api from "../config/axios"; // ✅ ONLY ADDED

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [student, setStudent] = useState(null);

  const [regPage, setRegPage] = useState(1);
  const [upPage, setUpPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  /* ================= LOAD STUDENT ================= */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.email) return navigate("/login");

      setStudent(parsedUser);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events/all"); // ✅ changed
        const data = res.data;
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch {
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  /* ================= FETCH REGISTRATIONS ================= */
  useEffect(() => {
    if (!student?.email) return;

    const fetchRegs = async () => {
      try {
        const res = await api.get(`/registrations/student/${student.email}`); // ✅ changed
        const data = res.data;
        const regs = data.registrations || data || [];

        regs.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setRegistrations(regs);
      } catch {
        setRegistrations([]);
      }
    };

    fetchRegs();
  }, [student?.email]);

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    if (!student?.email) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/registrations/student/${student.email}`); // ✅ changed
        const data = res.data;

        const sorted = (data.registrations || data || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setRegistrations(sorted);
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [student?.email]);

  /* ================= HELPERS ================= */
  const isRegistered = (eventId) =>
    registrations.some(
      (r) => r?.eventId && (r.eventId._id === eventId || r.eventId === eventId)
    );

  const upcomingEvents = events
    .filter(
      (ev) =>
        ev?.date &&
        new Date(ev.date).setHours(0, 0, 0, 0) >=
          new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upPaginated = upcomingEvents.slice(
    (upPage - 1) * ITEMS_PER_PAGE,
    upPage * ITEMS_PER_PAGE
  );

  const regPaginated = registrations.slice(
    (regPage - 1) * ITEMS_PER_PAGE,
    regPage * ITEMS_PER_PAGE
  );

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!student) return <div className="loading-screen"><h2>Loading...</h2></div>;

  return (
    <StudentLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
    >

      {/* ================= SAME UI BELOW ================= */}

      <section className="registrations-section">
        <h2>My Registrations</h2>

        <div className="registrations-grid">
          {regPaginated.map((r) => (
            <div key={r._id} className="event-card">
              <img src={r.eventId?.image} alt="" />
              <div className="event-info">
                <h3>{r.eventId?.title}</h3>
                <p>📅 {new Date(r.eventId?.date).toLocaleDateString()}</p>
                <p>🕒 {r.eventId?.time || "TBD"}</p>

                {r.status === "Approved" ? (
                  <span className="approved"><FaCheckCircle /> Approved</span>
                ) : (
                  <span className="pending"><FaClock /> Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="upcoming-section">
        <h2>Upcoming Events</h2>

        <div className="upcoming-grid">
          {upPaginated.map((event) => (
            <div key={event._id} className="upcoming-card">
              <img src={event.image} alt="" />
              <div className="event-info">
                <h3>{event.title}</h3>

                {isRegistered(event._id) ? (
                  <button disabled>Registered</button>
                ) : (
                  <button
                    onClick={() =>
                      navigate("/event-registration", { state: { event } })
                    }
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </StudentLayout>
  );
};

export default StudentDashboard;
