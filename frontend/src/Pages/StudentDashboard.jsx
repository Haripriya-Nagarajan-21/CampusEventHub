// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import "../Styles/StudentDashboard.css";
import { FaClock, FaCheckCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import api from "../config/axios"; // ✅ USE GLOBAL API

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

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/login");

    const parsed = JSON.parse(stored);
    if (!parsed?.email) return navigate("/login");

    setStudent(parsed);
  }, [navigate]);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get("/events/all"); // ✅ FIXED
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
        const { data } = await api.get(
          `/registrations/student/${student.email}` // ✅ FIXED
        );

        const regs = data.registrations || data || [];

        regs.sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
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
        const { data } = await api.get(
          `/registrations/student/${student.email}` // ✅ FIXED
        );

        setRegistrations(data.registrations || data || []);
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [student?.email]);

  /* ================= HELPERS ================= */
  const isRegistered = (eventId) =>
    registrations.some(
      (r) => r.eventId?._id === eventId || r.eventId === eventId
    );

  const upcomingEvents = events
    .filter(
      (ev) =>
        ev?.date &&
        new Date(ev.date) >= new Date()
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const regPaginated = registrations.slice(
    (regPage - 1) * ITEMS_PER_PAGE,
    regPage * ITEMS_PER_PAGE
  );

  const upPaginated = upcomingEvents.slice(
    (upPage - 1) * ITEMS_PER_PAGE,
    upPage * ITEMS_PER_PAGE
  );

  if (!student) return <h2>Loading...</h2>;

  return (
    <StudentLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    >
      {/* ================= HEADER ================= */}
      <div className="dashboard-header">
        <h2>Welcome, {student.fullName} 👋</h2>
      </div>

      {/* ================= MY REGISTRATIONS ================= */}
      <section>
        <h3>My Registrations</h3>

        {regPaginated.map((r) => (
          <div key={r._id} className="event-card">
            <h4>{r.eventId?.title}</h4>
            {r.status === "Approved" ? (
              <span className="approved">
                <FaCheckCircle /> Approved
              </span>
            ) : (
              <span className="pending">
                <FaClock /> Pending
              </span>
            )}
          </div>
        ))}
      </section>

      {/* ================= UPCOMING EVENTS ================= */}
      <section>
        <h3>Upcoming Events</h3>

        {upPaginated.map((event) => (
          <div key={event._id} className="event-card">
            <h4>{event.title}</h4>

            {isRegistered(event._id) ? (
              <button disabled>Registered</button>
            ) : (
              <button
                onClick={() =>
                  navigate("/event-registration", { state: { event } })
                }
              >
                Register
              </button>
            )}
          </div>
        ))}
      </section>
    </StudentLayout>
  );
};

export default StudentDashboard;
