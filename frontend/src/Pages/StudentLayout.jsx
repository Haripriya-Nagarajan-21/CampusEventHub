// src/Pages/StudentLayout.jsx
import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaSignOutAlt,
  FaEdit,
  FaSun,
  FaMoon,
  FaHome,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import "../Styles/StudentLayout.css";
import api from "../config/axios"; // ✅ USE GLOBAL API

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();

  /* ---------------- USER ---------------- */
  const defaultUser = { fullName: "Student", email: "", college: "" };
  const user = JSON.parse(localStorage.getItem("user")) || defaultUser;

  /* ---------------- Sidebar ---------------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  /* ---------------- Dark Mode ---------------- */
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("studentDarkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("studentDarkMode", next);
    document.documentElement.classList.toggle("dark", next);
  };

  /* ---------------- Notifications ---------------- */
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const seenKey = (email) => `seen_notifications_${email}`;

  /* =========================
     ✅ FIXED: API CALL
  ========================= */
  const loadNotifications = async () => {
    if (!user?.email) return;

    try {
      const { data } = await api.get(
        `/registrations/student/${user.email}`
      );

      const list = Array.isArray(data.registrations)
        ? data.registrations
        : [];

      const normalized = list.map((n) => ({
        _id: n._id,
        eventName: n.eventId?.title || "Event",
        status: n.status?.toLowerCase() || "",
        date: n.timestamp || null,
      }));

      setNotifications(normalized);

      const actionable = normalized.filter(
        (n) => n.status === "approved" || n.status === "rejected"
      );

      const ids = actionable.map((n) => n._id);
      const seen = JSON.parse(localStorage.getItem(seenKey(user.email))) || [];
      const unseen = ids.filter((id) => !seen.includes(id));

      setNotifCount(unseen.length);
    } catch {
      setNotifications([]);
      setNotifCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [user.email]);

  const handleBellClick = () => {
    const actionableIds = notifications
      .filter((n) => n.status === "approved" || n.status === "rejected")
      .map((n) => n._id);

    localStorage.setItem(seenKey(user.email), JSON.stringify(actionableIds));
    setNotifCount(0);
    setShowNotifDropdown(!showNotifDropdown);
  };

  /* ---------------- Profile ---------------- */
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  /* ---------------- Logout ---------------- */
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ---------------- Avatar ---------------- */
  const getGradient = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 50) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 55%), hsl(${hue2}, 70%, 55%))`;
  };

  const userInitial =
    (user.fullName?.charAt(0) || user.email?.charAt(0) || "S").toUpperCase();

  /* ---------------- RENDER ---------------- */
  return (
    <div className={`student-dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard"><FaHome /> Dashboard</NavLink>
          <NavLink to="/student/events"><FaClipboardList /> Events</NavLink>
          <NavLink to="/student/registrations"><FaCalendarAlt /> My Registrations</NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button onClick={toggleSidebar}>☰</button>

          <div className="right-controls">
            <div onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            {/* Notifications */}
            <div>
              <button onClick={handleBellClick}>
                <FaBell />
                {notifCount > 0 && <span>{notifCount}</span>}
              </button>

              {showNotifDropdown && (
                <div>
                  {notifications.map((n) => (
                    <div key={n._id}>
                      {n.eventName} — {n.status}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div onClick={toggleProfile}>
              <div style={{ background: getGradient(user.fullName) }}>
                {userInitial}
              </div>
            </div>

            <button onClick={() => setLogoutConfirmOpen(true)}>
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        {children}

        {logoutConfirmOpen && (
          <div>
            <p>Logout?</p>
            <button onClick={confirmLogout}>Yes</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentLayout;
