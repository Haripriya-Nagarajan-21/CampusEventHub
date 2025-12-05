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

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();

  /* ---------------- USER (Always Fresh From localStorage) ---------------- */
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

  const loadNotifications = async () => {
    if (!user?.email) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/student/${user.email}`
      );
      const data = await res.json();
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

  const handleBellClick = () => {
    const actionableIds = notifications
      .filter((n) => n.status === "approved" || n.status === "rejected")
      .map((n) => n._id);

    localStorage.setItem(seenKey(user.email), JSON.stringify(actionableIds));
    setNotifCount(0);

    setShowNotifDropdown(!showNotifDropdown);
  };

  /* ---------------- Profile Dropdown ---------------- */
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const toggleProfile = () => setProfileOpen(!profileOpen);

  /* ---------------- LOGOUT CONFIRMATION (ADDED) ---------------- */
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => setLogoutConfirmOpen(true);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  /* ---------------- Edit Profile ---------------- */
  const [editData, setEditData] = useState(user);

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSaveProfile = () => {
    localStorage.setItem("user", JSON.stringify(editData));
    setEditProfileOpen(false);
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
        <div className="sidebar-header">
          <h2>{sidebarOpen ? "🎓 EventHub" : "🎓"}</h2>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard"><FaHome /> {sidebarOpen && "Dashboard"}</NavLink>
          <NavLink to="/student/events"><FaClipboardList /> {sidebarOpen && "Events"}</NavLink>
          <NavLink to="/student/registrations"><FaCalendarAlt /> {sidebarOpen && "My Registrations"}</NavLink>
          <NavLink to="/student/profile"><FaHome /> {sidebarOpen && "Profile"}</NavLink>
        </nav>
      </aside>

      {sidebarOpen && window.innerWidth <= 1100 && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Navbar */}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-icon" onClick={toggleSidebar}>☰</button>

          <h2 className="student-title">Student Dashboard</h2>

          <div className="right-controls">

            {/* Dark Mode */}
            <div className="theme-switch" onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            {/* Notifications */}
            <div className="notif-container">
              <button className="bell-btn" onClick={handleBellClick}>
                <FaBell />
                {notifCount > 0 && <span className="badge">{notifCount}</span>}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown">
                  <h4>Notifications</h4>
                  <ul>
                    {notifications
                      .filter((n) => n.status === "approved" || n.status === "rejected")
                      .map((n) => (
                        <li key={n._id} className="notif-item">
                          <strong>{n.eventName}</strong>
                          <span className={n.status === "approved" ? "notif-approved" : "notif-rejected"}>
                            {n.status === "approved" ? "Approved 🎉" : "Rejected ❌"}
                          </span>
                        </li>
                      ))}

                    {notifications.filter(n => n.status === "approved" || n.status === "rejected").length === 0 && (
                      <p>No notifications</p>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="profile" onClick={toggleProfile}>
              <div className="profile-avatar" style={{ background: getGradient(user.fullName) }}>
                {userInitial}
              </div>

              {profileOpen && (
                <div className="profile-dropdown">

                  <div className="profile-info">
                    <h4>{user.fullName}</h4>
                    <p className="college">{user.college || "College Student"}</p>
                    <p className="email">{user.email}</p>
                  </div>

                  <hr className="profile-divider" />

                  <button
                    onClick={() => {
                      setEditProfileOpen(true);
                      setProfileOpen(false);
                    }}
                  >
                    <FaEdit /> Edit Profile
                  </button>

                  {/* NOW calls confirmation modal */}
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>

                </div>
              )}

            </div>

          </div>
        </header>

        {/*========= Page Content =========*/}
        {children}

        {/* Edit Profile Modal */}
        {editProfileOpen && (
          <div className="modal-overlay">
            <div className="edit-profile-modal">
              <h3>Edit Profile</h3>

              <label>Full Name</label>
              <input name="fullName" value={editData.fullName} onChange={handleEditChange} />

              <label>Email</label>
              <input name="email" value={editData.email} onChange={handleEditChange} />

              <label>College</label>
              <input name="college" value={editData.college} onChange={handleEditChange} />

              <div className="modal-buttons">
                <button className="save-btn" onClick={handleSaveProfile}>Save</button>
                <button className="cancel-btn" onClick={() => setEditProfileOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* LOGOUT CONFIRM MODAL */}
        {logoutConfirmOpen && (
          <div className="modal-overlay" onClick={cancelLogout}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>

              <div className="modal-buttons">
                <button className="save-btn" onClick={confirmLogout}>Yes, Logout</button>
                <button className="cancel-btn" onClick={cancelLogout}>No, Stay</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentLayout;
