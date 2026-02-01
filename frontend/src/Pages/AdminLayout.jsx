// src/Pages/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaEdit,
  FaSignOutAlt,
  FaCheckCircle,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../Styles/AdminLayout.css";
import api from "../config/axios"; // ✅ ONLY ADDITION

const AdminLayout = ({
  children,
  currentPath,
  onNavigate,
  updateUser = () => {},
  onLogout = () => {},
}) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  /* ================= DARK MODE ================= */
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("adminDarkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("admin-dark", isDark);
  }, []);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("adminDarkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("admin-dark", next);
  };

  /* ================= USER ================= */
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : { fullName: "Admin", email: "", college: "" };
  });

  const [editData, setEditData] = useState({
    fullName: user.fullName,
    email: user.email,
    college: user.college,
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleNotif = () => setNotifOpen(!notifOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const handleLogout = () => setLogoutConfirmOpen(true);

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  };

  const cancelLogout = () => setLogoutConfirmOpen(false);

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSaveProfile = () => {
    setUser(editData);
    localStorage.setItem("user", JSON.stringify(editData));
    updateUser(editData);
    setEditProfileOpen(false);
  };

  /* =====================================================
     ✅ ONLY CHANGE HERE: fetch → axios api.get
  ====================================================== */
  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/registrations/pending"); // ✅ FIXED
        const data = res.data;

        if (mounted) {
          setNotifications(data);
          setNotifCount(data.length);
        }
      } catch {
        if (mounted) {
          setNotifications([]);
          setNotifCount(0);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNotifClick = () => {
    setNotifOpen(false);
    navigate("/admin/registrations");
  };

  const getGradient = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 65%, 55%), hsl(${hue2}, 65%, 55%))`;
  };

  const userInitial = user.fullName.charAt(0).toUpperCase();

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />

      {sidebarOpen && window.innerWidth <= 1100 && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <main className="main-content">
        <header className="topbar">
          {/* KEEP ALL YOUR ORIGINAL CLASSES */}
          <button className="menu-icon" onClick={toggleSidebar}>☰</button>

          <h2 className="admin-title">Admin Dashboard</h2>

          <div className="right-controls">

            <div className="theme-switch" onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            {/* Notifications */}
            <div className="notification" onClick={toggleNotif}>
              <FaBell />
              {notifCount > 0 && <span className="notif-count">{notifCount}</span>}

              {notifOpen && (
                <div className="notif-dropdown">
                  {notifications.length > 0 ? (
                    notifications.map((notif, i) => (
                      <div key={i} className="notif-item" onClick={handleNotifClick}>
                        <div className="notif-top">
                          <strong>{notif.studentName}</strong>
                          <span className="notif-status">
                            <FaCheckCircle /> Registered
                          </span>
                        </div>
                        <p className="notif-event">
                          Event: <b>{notif.eventName}</b>
                        </p>
                        <small>
                          🕒 {new Date(notif.timestamp).toLocaleString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="no-notif">No new notifications</div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="profile" onClick={toggleProfile}>
              <div
                className="profile-avatar"
                style={{ background: getGradient(user.fullName) }}
              >
                {userInitial}
              </div>

              {profileOpen && (
                <div className="profile-dropdown">
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
