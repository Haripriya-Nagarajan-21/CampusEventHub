// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import "../Styles/StudentDashboard.css";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSearch,
  FaHome,
  FaCalendarAlt,
  FaSignOutAlt,
  FaCog,
  FaClock,
  FaCheckCircle,
  FaMoon,
  FaSun,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate, NavLink, useLocation } from "react-router-dom"; // ✅ added useLocation
import StudentLayout from "./StudentLayout";
import api from "../config/axios"; // ✅ axios instance

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [student, setStudent] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [unseenApprovedIds, setUnseenApprovedIds] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [regPage, setRegPage] = useState(1);
  const [upPage, setUpPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();
  const location = useLocation(); // ✅ fix missing location
  const profileRef = useRef(null);

  // ================= LOAD STUDENT =================
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

  // ================= THEME =================
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // ================= SIDEBAR MEMORY =================
  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved === "true") setSidebarOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
  }, [sidebarOpen]);

  // ================= FETCH EVENTS =================
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get("/events/all"); // ✅ converted
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch {
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  // ================= FETCH REGISTRATIONS =================
  useEffect(() => {
    if (!student?.email) return;

    const fetchRegs = async () => {
      try {
        const { data } = await api.get(
          `/registrations/student/${student.email}` // ✅ converted
        );

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

  // 🔄 AUTO REFRESH REGISTRATIONS
  useEffect(() => {
    if (!student?.email) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(
          `/registrations/student/${student.email}` // ✅ converted
        );

        const sorted = (data.registrations || data || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setRegistrations(sorted);
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [student?.email]);

  // ================= UTILITIES =================
  const getGreeting = (username) => {
    const hour = new Date().getHours();
    let greeting = "";

    if (hour < 12) greeting = "Good Morning ☀️";
    else if (hour < 17) greeting = "Good Afternoon 🌤️";
    else greeting = "Good Evening 🌙";

    return `${greeting}, ${username}`;
  };

  const isRegistered = (eventId) =>
    registrations.some(
      (r) => r?.eventId && (r.eventId._id === eventId || r.eventId === eventId)
    );

  // ================= UPCOMING EVENTS =================
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

  if (!student)
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    );

  return (
    <StudentLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
    >
      <div className="dashboard-header hero">
        <div className="hero-content">
          <div className="welcome-text">
            <h2>{getGreeting(student.fullName)}👋 </h2>
            <p>Welcome back — here’s a quick summary of your events.</p>
          </div>
          <div className="stats-grid center-stats">
            <div className="stat-card">
              <h2>{registrations.length}</h2>
              <p>Events Registered</p>
            </div>
            <div className="stat-card">
              <h2>{upcomingEvents.length}</h2>
              <p>Upcoming Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* MY REGISTRATIONS */}
      <section className="registrations-section">
        <div className="section-header">
          <h2>My Registrations</h2>
          <button
            className="view-all"
            onClick={() => navigate("/student/registrations")}
          >
            View All
          </button>
        </div>

        <div className="registrations-grid">
          {regPaginated.map((r) => (
            <div key={r._id} className="event-card">
              <img src={r.eventId?.image} alt="" />
              <div className="event-info">
                <h3>{r.eventId?.title}</h3>
                <p>📅 {new Date(r.eventId?.date).toLocaleDateString()}</p>
                <p>🕒 {r.eventId?.time || "TBD"}</p>
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
            </div>
          ))}
        </div>
      </section>
    </StudentLayout>
  );
};

export default StudentDashboard;
