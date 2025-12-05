// src/Pages/StudentLayout.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
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

// Context to share user data across components
export const UserContext = createContext(null);

/**
 * StudentLayout
 * Props:
 *  - children
 *  - updateUser (optional) : function called when profile saved
 *  - onLogout (optional) : function called when user logs out
 *
 * The component preserves your original logic but fixes initialization order,
 * provides safe fallbacks, and implements missing helper functions.
 */
const StudentLayout = ({ children, updateUser = () => {}, onLogout = () => {} }) => {
  const navigate = useNavigate();

  // === Defaults & context ===
  const userContext = useContext(UserContext) || {};
  const defaultUser = { fullName: "Student", email: "", college: "" };

  // === Primary user state (defined first so other derived values can use it) ===
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user") || localStorage.getItem("student");
      return storedUser ? JSON.parse(storedUser) : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  // editData must be initialized after user
  const [editData, setEditData] = useState({
    fullName: user.fullName,
    email: user.email,
    college: user.college,
  });

  // currentUser mirrors other sources (keeps your original 'currentUser' logic)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedStudent = localStorage.getItem("student");
      return (
        userContext.user ||
        (storedStudent ? JSON.parse(storedStudent) : null) ||
        user ||
        defaultUser
      );
    } catch {
      return user || defaultUser;
    }
  });

  // If currentUser changes, keep `user` in sync (preserves your original effect)
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      // reflect to editData too so the edit modal shows latest
      setEditData({
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        college: currentUser.college || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // === Sidebar ===
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((s) => !s);

  // === Dark mode ===
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("studentDarkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("student-dark", saved);
  }, []);
  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("studentDarkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("student-dark", next);
  };

  // === Notifications ===
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const seenKey = (email) => `seen_notifications_${email}`;

  const loadNotifications = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/student/${encodeURIComponent(currentUser.email)}`
      );
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((n) => ({
            _id: n._id,
            eventName: n.eventId?.title || n.eventName || "Event",
            status: (n.status || "").toLowerCase(),
            date: n.date || n.timestamp || null,
            raw: n,
          }))
        : [];
      setNotifications(normalized);

      const actionable = normalized.filter((n) => n.status === "approved" || n.status === "rejected");
      const ids = actionable.map((n) => n._id);
      const seen = JSON.parse(localStorage.getItem(seenKey(currentUser.email))) || [];
      const unseen = ids.filter((id) => !seen.includes(id));
      setNotifCount(unseen.length);
    } catch (err) {
      // keep notifications empty on error, as original code intended
      setNotifications([]);
      setNotifCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  const handleBellClick = () => {
    if (!currentUser?.email) {
      // toggle dropdown anyway if no user
      setShowNotifDropdown((s) => !s);
      return;
    }
    const actionableIds = notifications
      .filter((n) => n.status === "approved" || n.status === "rejected")
      .map((n) => n._id);
    try {
      localStorage.setItem(seenKey(currentUser.email), JSON.stringify(actionableIds));
    } catch {}
    setNotifCount(0);
    setShowNotifDropdown((s) => !s);
  };

  // === Profile & Modals ===
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // toggle profile dropdown (added because it was referenced earlier)
  const toggleProfile = () => setProfileOpen((p) => !p);

  // handleLogout opens confirm modal (keeps parity with AdminLayout)
  const handleLogout = () => setLogoutConfirmOpen(true);

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("student");
    } catch {}
    // call external onLogout hook if provided
    try {
      onLogout();
    } catch {}
    navigate("/login");
  };
  const cancelLogout = () => setLogoutConfirmOpen(false);

  const handleEditChange = (e) =>
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProfile = () => {
    const updated = {
      fullName: editData.fullName || user.fullName,
      email: editData.email || user.email,
      college: editData.college || user.college,
    };
    setUser(updated);
    setCurrentUser(updated);
    try {
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("student", JSON.stringify(updated));
    } catch {}
    try {
      updateUser(updated);
    } catch {}
    setEditProfileOpen(false);
  };

  // === Avatar gradient and initial ===
  const getGradient = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 65%, 55%), hsl(${hue2}, 65%, 55%))`;
  };

  const userInitial = (user?.fullName?.charAt(0) || user?.email?.charAt(0) || "S").toUpperCase();

  // === Render ===
  return (
    <div
      className={`student-dashboard-container ${
        sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <h2>{sidebarOpen ? "🎓 EventHub" : "🎓"}</h2>
        </div>
        <nav className="sidebar-menu">
          <NavLink to="/student-dashboard">
            <FaHome /> {sidebarOpen && "Dashboard"}
          </NavLink>
          <NavLink to="/student/events">
            <FaClipboardList /> {sidebarOpen && "Explore Events"}
          </NavLink>
          <NavLink to="/student/registrations">
            <FaCalendarAlt /> {sidebarOpen && "My Registrations"}
          </NavLink>
          <NavLink to="/student/profile">
            <FaHome /> {sidebarOpen && "Profile"}
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-icon" onClick={toggleSidebar}>
            ☰
          </button>
          <h2 className="student-title">Student Dashboard</h2>

          <div className="right-controls">
            <div className="theme-switch" onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </div>

            <div className="notif-container">
              <button className="bell-btn" onClick={handleBellClick}>
                <FaBell />
                {notifCount > 0 && <span className="badge">{notifCount}</span>}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown">
                  <h4 className="notif-title">Notifications</h4>

                  <ul className="notif-list">
                    {notifications
                      .filter((n) => n.status === "approved" || n.status === "rejected")
                      .map((n) => (
                        <li
                          key={n._id}
                          className="notif-item"
                          onClick={() => navigate(`/student/registrations#${n._id}`)}
                        >
                          <div className="notif-text">
                            <strong>{n.eventName}</strong>
                            <span
                              className={
                                n.status === "approved" ? "notif-approved" : "notif-rejected"
                              }
                            >
                              {n.status === "approved" ? "Approved 🎉" : "Rejected ❌"}
                            </span>
                          </div>

                          <small className="notif-date">
                            {n.date ? new Date(n.date).toLocaleDateString() : "No Date"}
                          </small>
                        </li>
                      ))}

                    {notifications.filter((n) => n.status === "approved" || n.status === "rejected")
                      .length === 0 && <p className="no-notif">No new notifications</p>}
                  </ul>
                </div>
              )}
            </div>

            <div className="profile" onClick={toggleProfile}>
              <div className="profile-avatar" style={{ background: getGradient(user.fullName) }}>
                {userInitial}
              </div>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <h4>{user.fullName}</h4>
                    <p>{user.college || "College Admin"}</p>
                    <p className="email">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditProfileOpen(true);
                      setProfileOpen(false);
                      setEditData(user);
                    }}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}

        {editProfileOpen && (
          <div className="modal-overlay" onClick={() => setEditProfileOpen(false)}>
            <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Profile</h3>
              <label>Full Name</label>
              <input type="text" name="fullName" value={editData.fullName} onChange={handleEditChange} />
              <label>Email</label>
              <input type="email" name="email" value={editData.email} onChange={handleEditChange} />
              <label>College</label>
              <input type="text" name="college" value={editData.college} onChange={handleEditChange} />
              <div className="modal-buttons">
                <button className="save-btn" onClick={handleSaveProfile}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => setEditProfileOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {logoutConfirmOpen && (
          <div className="modal-overlay" onClick={cancelLogout}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="modal-buttons">
                <button className="save-btn" onClick={confirmLogout}>
                  Yes, Logout
                </button>
                <button className="cancel-btn" onClick={cancelLogout}>
                  No, Stay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentLayout;
