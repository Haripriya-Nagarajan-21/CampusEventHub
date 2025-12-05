import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import "../Styles/StudentRegistrations.css";
import {
  FaBars,
  FaUserCircle,
  FaSearch,
  FaHome,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaTrash,
  FaCommentDots,
  FaBell,
  FaClipboardList,
} from "react-icons/fa";
import StudentLayout from "./StudentLayout";

const StudentRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [student, setStudent] = useState(null);
const [sidebarOpen, setSidebarOpen] = useState(
  localStorage.getItem("sidebarOpen") === "true"
);
const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.email) return navigate("/login");
      setStudent(parsedUser);
    } catch (err) {
      console.error("Invalid user data in localStorage", err);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (!student?.email) return;
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/registrations/student/${student.email}`
        );
        const data = await res.json();
        setRegistrations(data.registrations || data || []);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setRegistrations([]);
      }
    };
    fetchRegistrations();
  }, [student?.email]);
  
useEffect(() => {
  localStorage.setItem("sidebarOpen", sidebarOpen);
}, [sidebarOpen]);


  useEffect(() => {
  if (!student?.email) return;
  const fetchRegistrations = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/student/${student.email}`
      );
      const data = await res.json();

      setRegistrations((data.registrations || data || []).map((r) => {
  const givenKey = `fb_${r.eventId?._id}_${student.email}`;
  const lockKey = `fb_lock_${r.eventId?._id}_${student.email}`;
  return {
    ...r,
    feedbackGiven: localStorage.getItem(givenKey) === "true",
    feedbackLocked: localStorage.getItem(lockKey) === "true"
  };
}));

    } catch (err) {
      console.error("Error fetching registrations:", err);
      setRegistrations([]);
    }
  };
  fetchRegistrations();
}, [student?.email]);

  

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("dark", next);
  };

  const confirmDelete = (id) => {
    setRegistrationToDelete(id);
    setDeleteModalOpen(true);
  };
  const handleDelete = async () => {
    if (!registrationToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/${registrationToDelete}`,
        { method: "DELETE" }
      );
      let data;
      try {
        data = await res.json();
      } catch {
        data = { success: res.ok, message: res.statusText };
      }
      if (res.ok && data.success) {
        setRegistrations((prev) =>
          prev.filter((r) => r._id !== registrationToDelete)
        );
      } else {
        alert(data.message || "Failed to delete registration.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting registration.");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setRegistrationToDelete(null);
    }
  };

  const handleFeedback = (eventId) => {
    navigate(`/student/feedback/${eventId}`);
  };

  
  // Categorize events
  const categorizeEvents = () => {
    const now = new Date();
    const past = [];
    const ongoing = [];
    const upcoming = [];

    registrations.forEach((reg) => {
      if (!reg.eventId) return;
      const eventDate = new Date(reg.eventId.date);
      const eventTime = reg.eventId.time || "00:00";
      const [hours, minutes] = (eventTime.split(":").map(Number)) || [0, 0];
      const eventDateTime = new Date(eventDate);
      eventDateTime.setHours(hours, minutes, 0, 0);

      const isToday = eventDate.toDateString() === now.toDateString();
      const timeDiff = eventDateTime - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (eventDateTime < now && hoursDiff < -2) past.push(reg);
      else if (isToday && hoursDiff >= -2 && hoursDiff <= 4) ongoing.push(reg);
      else if (eventDateTime > now) upcoming.push(reg);
      else past.push(reg);
    });

    // Sort each category by date ascending for consistent order
    const sortByDate = (arr) =>
      arr.sort((a, b) => {
        const da = a.eventId?.date ? new Date(a.eventId.date) : new Date(8640000000000000);
        const db = b.eventId?.date ? new Date(b.eventId.date) : new Date(8640000000000000);
        return da - db;
      });

    return { past: sortByDate(past), ongoing: sortByDate(ongoing), upcoming: sortByDate(upcoming) };
  };

  const { past, ongoing, upcoming } = categorizeEvents();
  const filterRegistrations = (regs) => {
    if (!searchTerm.trim()) return regs;
    const term = searchTerm.toLowerCase();
    return regs.filter((reg) => {
      const event = reg.eventId || {};
      return (
        event.title?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term) ||
        event.category?.toLowerCase().includes(term)
      );
    });
  };

  const filteredPast = filterRegistrations(past);
  const filteredOngoing = filterRegistrations(ongoing);
  const filteredUpcoming = filterRegistrations(upcoming);


const EventCard = ({ reg, colorClass }) => {
  const isApproved = reg.status === "Approved";

  // Enable feedback ONLY if approved
  const canFeedback = isApproved;

  const feedbackTitle = !isApproved
    ? " unavailable"
    : reg.feedbackGiven
    ? "Edit feedback"
    : " feedback";

  const feedbackLabel = !isApproved
    ? "Awaiting Approval"
    : reg.feedbackGiven
    ? "Edit Feedback"
    : "Feedback";

  const canDelete = colorClass === "upcoming" || colorClass === "past";

  return (
    <div className="registration-card">
      <img
        src={
          reg.eventId?.image ||
          "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
        }
        alt={reg.eventId?.title || "Event"}
      />

      <div className="registration-info">
        <h4>{reg.eventId?.title || "Event Title"}</h4>

        <p className="meta">
          📅{" "}
          {reg.eventId?.date
            ? new Date(reg.eventId.date).toLocaleDateString()
            : "TBD"}
        </p>
        <p className="meta">🕒 {reg.eventId?.time || "TBD"}</p>
        <p className="meta">📍 {reg.eventId?.venue || "TBD"}</p>
        <p className="meta">🏷️ {reg.eventId?.category || "N/A"}</p>

        <div className="status-row">
          <div className="status-badge">
            {reg.status === "Approved" ? (
              <span className="status-approved">
                <FaCheckCircle /> Approved
              </span>
            ) : reg.status === "Rejected" ? (
              <span className="status-rejected">
                <FaTimes /> Rejected
              </span>
            ) : (
              <span className="status-pending">
                <FaClock /> Pending
              </span>
            )}
          </div>

          <div className="inline-actions">

            {/* DELETE BUTTON for Upcoming + Past */}
            {canDelete && (
             <button
  className="delete-inline-btn tooltip"
  data-tip="Delete Registration"
  onClick={() => confirmDelete(reg._id)}
>
  <FaTrash />
</button>

            )}

            {/* FEEDBACK BUTTON */}
            <button
  className={`feedback-inline-btn tooltip ${!canFeedback ? "disabled-btn" : ""}`}
  onClick={() => canFeedback && handleFeedback(reg.eventId?._id)}
  data-tip={feedbackTitle}
  disabled={!canFeedback}
>
  <FaCommentDots />
</button>

          </div>
        </div>
      </div>
    </div>
  );
};
const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!student) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <StudentLayout currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}>
   
      {/* Sidebar */}
     
      {/* Main Content */}
      <div >
        
        {/* Header */}
        <div className="registrations-header">
          <h2>My Event Registrations</h2>
          <p>View all your registered events organized by status</p>
        </div>

        <div className="registrations-container">
          <div className="registrations-category">
            <h3 className="category-title upcoming">Upcoming Events ({filteredUpcoming.length})</h3>
            {filteredUpcoming.length > 0 ? (
              <div className="registrations-grid">
                {filteredUpcoming.map((r) => <EventCard key={r._id} reg={r} colorClass="upcoming" />)}
              </div>
            ) : <p className="empty-message">No upcoming events</p>}
          </div>

          <div className="registrations-category">
            <h3 className="category-title ongoing">Ongoing Events ({filteredOngoing.length})</h3>
            {filteredOngoing.length > 0 ? (
              <div className="registrations-grid">
                {filteredOngoing.map((r) => <EventCard key={r._id} reg={r} colorClass="ongoing" />)}
              </div>
            ) : <p className="empty-message">No ongoing events</p>}
          </div>

          <div className="registrations-category">
            <h3 className="category-title past">Past Events ({filteredPast.length})</h3>
            {filteredPast.length > 0 ? (
              <div className="registrations-grid">
                {filteredPast.map((r) => <EventCard key={r._id} reg={r} colorClass="past" />)}
              </div>
            ) : <p className="empty-message">No past events</p>}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="edit-profile-modal settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this registration?</p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
  <button
    className="cancel-btn"
    style={{ flex: 1 }}
    onClick={() => setDeleteModalOpen(false)}
  >
    No
  </button>

  <button
    className="delete-btn"
    style={{ flex: 1 }}
    onClick={handleDelete}
    disabled={deleting}
  >
    {deleting ? "Deleting..." : "Yes"}
  </button>
</div>

          </div>
        </div>
      )}
      
   
    </StudentLayout>
  );
};

export default StudentRegistrations;
