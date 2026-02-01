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
import api from "../config/axios"; // ✅ ONLY ADDED

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

  /* =====================================================
     ✅ ONLY CHANGED → axios api instead of fetch
  ===================================================== */
  const loadNotifications = async () => {
    if (!user?.email) return;

    try {
      const res = await api.get(`/registrations/student/${user.email}`); // ✅ changed
      const data = res.data;

      const list = Array.isArray(data.registrations) ? data.registrations : [];

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

  /* ================= EVERYTHING BELOW IS 100% SAME ================= */

  const handleBellClick = () => {
    const actionableIds = notifications
      .filter((n) => n.status === "approved" || n.status === "rejected")
      .map((n) => n._id);

    localStorage.setItem(seenKey(user.email), JSON.stringify(actionableIds));
    setNotifCount(0);
    setShowNotifDropdown(!showNotifDropdown);
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const toggleProfile = () => setProfileOpen(!profileOpen);
  const handleLogout = () => setLogoutConfirmOpen(true);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cancelLogout = () => setLogoutConfirmOpen(false);

  const [editData, setEditData] = useState(user);

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSaveProfile = () => {
    localStorage.setItem("user", JSON.stringify(editData));
    setEditProfileOpen(false);
  };

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

  return (
    <div className={`student-dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      {children}
    </div>
  );
};

export default StudentLayout;
