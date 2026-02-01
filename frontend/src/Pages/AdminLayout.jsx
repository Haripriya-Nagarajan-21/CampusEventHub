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
import api from "../config/axios"; // ✅ ADD THIS

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

  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser)
      : { fullName: "Admin", email: "", college: "" };
  });

  const [editData, setEditData] = useState(user);

  /* ================= DARK MODE ================= */
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleNotif = () => setNotifOpen(!notifOpen);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* =====================================================
     ✅ FIXED: USE AXIOS INSTANCE INSTEAD OF LOCALHOST FETCH
  ====================================================== */
  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/registrations/pending"); // ✅ FIXED
        if (mounted) {
          setNotifications(res.data || []);
          setNotifCount(res.data?.length || 0);
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

  const userInitial = user.fullName.charAt(0).toUpperCase();

  return (
    <div className={`dashboard-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />

      <main className="main-content">
        <header className="topbar">
          <button onClick={toggleSidebar}>☰</button>

          <div className="right-controls">
            <div onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            {/* Notifications */}
            <div onClick={toggleNotif}>
              <FaBell />
              {notifCount > 0 && <span>{notifCount}</span>}

              {notifOpen && (
                <div>
                  {notifications.map((n, i) => (
                    <div key={i}>
                      <strong>{n.studentName}</strong>
                      <p>{n.eventName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div onClick={toggleProfile}>
              <div>{userInitial}</div>
              {profileOpen && (
                <div>
                  <button onClick={confirmLogout}>
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
