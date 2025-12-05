import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import "../Styles/EventsPage.css";
import AdminLayout from "../Pages/AdminLayout";

import {
  FaBars,
  FaUserCircle,
  FaSearch,
  FaHome,
  FaCalendarAlt,
  FaClipboardList,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaTrash,
  FaClipboardList as FaClipboardList2,
} from "react-icons/fa";

import { FaEdit, FaUsers } from "react-icons/fa";
import { notifySuccess, notifyError } from "../utils/toast";
import StudentLayout from "./StudentLayout";


const EventsPage = ({ userRole = "student" }) => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]); // used for student notifications & isRegistered
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
const [showLogoutModal, setShowLogoutModal] = useState(false);
  const categories = ["All", "This Week", "Technical", "Sports", "Workshop", "Cultural"];
  const [activeCategory, setActiveCategory] = useState("All");

  // Admin-specific: selected event + its registrations
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegs, setEventRegs] = useState([]); // registrations for currently opened event (filtered)
  const [regsLoading, setRegsLoading] = useState(false);
  const [showRegsModal, setShowRegsModal] = useState(false);
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal UI: search and pagination
  const [regSearch, setRegSearch] = useState("");
  const [regPage, setRegPage] = useState(1);
  const REGS_PER_PAGE = 8;

 
  const modalRef = useRef(null);


 const [sidebarOpen, setSidebarOpen] = useState(
  localStorage.getItem("sidebarOpen") === "true"
);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const profileRef = useRef(null);

  // -----------------------
  // Load student info
  // -----------------------
  useEffect(() => {
    if (userRole === "student") {
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
    }
  }, [navigate, userRole]);

  // -----------------------
  // Load theme
  // -----------------------
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // -----------------------
  // Fetch all events
  // -----------------------
  useEffect(() => {
    fetch("http://localhost:5000/api/events/all")
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setEvents(data) : setEvents([])))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (!student?.email) return;
    fetch(`http://localhost:5000/api/registrations/student/${student.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.registrations)) {
          setRegistrations(data.registrations);
        } else if (Array.isArray(data)) {
          setRegistrations(data);
        } else {
          setRegistrations([]);
        }
      })
      .catch(() => setRegistrations([]));
  }, [student?.email]);

  
  const getApprovedIds = (regs = registrations) =>
    regs.filter((r) => r.status === "Approved" && r.eventId).map((r) => r._id);

  const seenKey = (email) => `seenApproved_${email || "anon"}`;
  const [unseenApprovedIds, setUnseenApprovedIds] = useState([]);

  useEffect(() => {
    if (!student?.email) return;
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    const unseen = approved.filter((id) => !seen.includes(id));
    setUnseenApprovedIds(unseen);
  }, [registrations, student?.email]);

 useEffect(() => {
  localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
}, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const toggleProfileMenu = () => setShowProfileMenu((s) => !s);

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next ? "true" : "false");
    document.documentElement.classList.toggle("dark", next);
  };

  // -----------------------
  // Delete flow (events)
  // -----------------------
  const triggerDeleteEvent = (event) => {
    setDeleteTarget(event);
    setShowDeleteModal(true);
  };

  const handleDeleteEvent = async () => {
    const event = deleteTarget;
    if (!event) return notifyError("No event selected");
    const id = event._id || event.id;
    if (!id) return notifyError("Invalid event ID");

    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && (data.success || data.message)) {
        setEvents((prev) => prev.filter((e) => String(e._id || e.id) !== String(id)));
        notifySuccess("Event deleted successfully");
      } else {
        const msg = data.message || "Failed to delete event";
        notifyError(msg);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      notifyError("Network error while deleting event");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // -----------------------
  // Admin: view registrations
  // -----------------------
  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event);
    setShowRegsModal(true);
    setRegsLoading(true);
    setEventRegs([]);
    setRegSearch("");
    setRegPage(1);

    try {
      const res = await fetch("http://localhost:5000/api/registrations");
      const data = await res.json();
      let allRegs = [];

      if (data && data.success && Array.isArray(data.registrations)) {
        allRegs = data.registrations;
      } else if (Array.isArray(data)) {
        allRegs = data;
      } else {
        allRegs = [];
      }

      const eventId = event._id || event.id;
      const filtered = allRegs.filter((r) => {
        const rid = r.eventId?._id || r.eventId || (r.eventId && r.eventId.id) || r.event;
        const ridStr = typeof rid === "object" ? (rid._id || rid.id) : rid;
        return String(ridStr) === String(eventId) || (r.eventId && r.eventId._id && String(r.eventId._id) === String(eventId));
      });

      setEventRegs(filtered);
    } catch (err) {
      console.error("Failed to load registrations", err);
      setEventRegs([]);
    } finally {
      setRegsLoading(false);
    }
  };

  const closeRegsModal = () => {
    setShowRegsModal(false);
    setSelectedEvent(null);
    setEventRegs([]);
    setRegSearch("");
    setRegPage(1);
  };

  // -----------------------
  // Filter + Sort events
  // -----------------------
  const filteredEvents = events
    .filter((event) => {
      if (activeCategory !== "All") {
        if (activeCategory === "This Week") {
          const now = new Date();
          const eventDate = new Date(event.date);
          const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);
          if (diffDays < 0 || diffDays > 7) return false;
        } else if ((event.category || "").toLowerCase() !== activeCategory.toLowerCase()) {
          return false;
        }
      }
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        (event.title || "").toLowerCase().includes(term) ||
        (event.category || "").toLowerCase().includes(term) ||
        (event.venue || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Header section (shared)
  const headerSection = (
    <div className="events-header">
      <h2>{userRole === "admin" ? "Manage Events" : "Upcoming Events"}</h2>
      <div className="events-controls">
        <input
          type="text"
          placeholder="Search by title, category, or venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button
          className="sort-btn"
          onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}
        >
          Sort by Date ({sortOrder === "asc" ? "Oldest" : "Newest"})
        </button>
      </div>
    </div>
  );

  // Modal helpers: derived filtered registrations & pagination
  const filteredEventRegs = useMemo(() => {
    const term = regSearch.trim().toLowerCase();
    if (!term) return eventRegs;
    return eventRegs.filter((r) => {
      const student = r.student || r.user || {};
      const name = (student.name || r.studentName || r.name || `${student.firstName || ""} ${student.lastName || ""}`).toString().toLowerCase();
      const email = (student.email || r.studentEmail || r.email || "").toString().toLowerCase();
      const college = (student.department || r.collegeName || r.college || r.institution || "").toString().toLowerCase();
      const any = `${name} ${email} ${college} ${r._id || r.id || ""}`.toLowerCase();
      return any.includes(term);
    });
  }, [eventRegs, regSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredEventRegs.length / REGS_PER_PAGE));
  const paginatedRegs = filteredEventRegs.slice((regPage - 1) * REGS_PER_PAGE, regPage * REGS_PER_PAGE);

  // Export to PDF (NO PHONE column). Uses local libs if available, otherwise CDN, else print fallback.
  const exportRegistrationsPDF = async () => {
    if (!selectedEvent) return alert("No event selected");
    const rows = eventRegs.map((r, idx) => {
      const student = r.student || r.user || {};
      const name = student.name || r.studentName || r.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "";
      const email = student.email || r.studentEmail || r.email || "";
      const college = r.collegeName || r.college || r.institution || "";
      const registeredAt = r.createdAt || r.registeredAt || r.timestamp || "";
      const regId = r._id || r.id || "";
      const viewUrl = `${window.location.origin}/admin/registrations?highlight=${regId}`;
      return { idx: idx + 1, name, email, college, registeredAt, regId, viewUrl };
    });

    try {
      let html2canvasLib, jsPDFLib;
      try {
        html2canvasLib = (await import("html2canvas")).default;
        jsPDFLib = (await import("jspdf")).jsPDF;
      } catch (err) {
        const loadScript = (src) =>
          new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = resolve;
            s.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
          });

        await loadScript("https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js");
        await loadScript("https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js");
        html2canvasLib = window.html2canvas;
        jsPDFLib = window.jspdf && window.jspdf.jsPDF;
      }

      if (!html2canvasLib || !jsPDFLib) throw new Error("PDF libs missing");

      const container = document.createElement("div");
      container.style.width = "1100px";
      container.style.padding = "24px";
      container.style.background = "#ffffff";
      container.style.fontFamily = "Arial, sans-serif";
      container.innerHTML = `
        <h2 style="color:#111827;margin:0 0 8px">Registrations for ${selectedEvent?.title || ""}</h2>
        <p style="color:#6b7280;margin:0 0 16px">${rows.length} registration${rows.length !== 1 ? "s" : ""}</p>
        <table style="width:100%;border-collapse:collapse;font-family:inherit;">
          <thead>
            <tr style="background:#2563eb;color:#fff;">
              <th style="padding:10px;border:1px solid #e5e7eb;">#</th>
              <th style="padding:10px;border:1px solid #e5e7eb;">Name</th>
              <th style="padding:10px;border:1px solid #e5e7eb;">Email</th>
              <th style="padding:10px;border:1px solid #e5e7eb;">College</th>
              <th style="padding:10px;border:1px solid #e5e7eb;">Registered At</th>
              <th style="padding:10px;border:1px solid #e5e7eb;">View URL</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr>
                <td style="padding:8px;border:1px solid #eef2f7;">${r.idx}</td>
                <td style="padding:8px;border:1px solid #eef2f7;">${r.name}</td>
                <td style="padding:8px;border:1px solid #eef2f7;">${r.email}</td>
                <td style="padding:8px;border:1px solid #eef2f7;">${r.college}</td>
                <td style="padding:8px;border:1px solid #eef2f7;">${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "—"}</td>
                <td style="padding:8px;border:1px solid #eef2f7;"><small>${r.viewUrl}</small></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `;
      document.body.appendChild(container);

      const canvas = await html2canvasLib(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDFLib({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      const safeTitle = (selectedEvent?.title || "registrations").replace(/\s+/g, "_").toLowerCase();
      pdf.save(`${safeTitle}_registrations.pdf`);

      document.body.removeChild(container);
      return;
    } catch (err) {
      console.warn("Image PDF failed — falling back to print:", err);
    }

    try {
      const printWindow = window.open("", "_blank", "width=1000,height=700,scrollbars=yes");
      const html = `
        <html>
          <head>
            <title>Registrations - ${selectedEvent?.title || ""}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
              table { border-collapse: collapse; width: 100%; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background: #2563eb; color: white; }
              h2 { color: #111827; }
              small { word-break: break-all; }
            </style>
          </head>
          <body>
            <h2>Registrations for ${selectedEvent?.title || ""}</h2>
            <p>${rows.length} registration${rows.length !== 1 ? "s" : ""}</p>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>College</th><th>Registered At</th><th>View URL</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (r) => `
                  <tr>
                    <td>${r.idx}</td>
                    <td>${r.name}</td>
                    <td>${r.email}</td>
                    <td>${r.college}</td>
                    <td>${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "—"}</td>
                    <td><small>${r.viewUrl}</small></td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    } catch (err) {
      console.error("Print fallback failed:", err);
      alert("Could not export PDF. Please try installing html2canvas & jspdf or use browser print.");
    }
  };

  // -----------------------
  // ADMIN VIEW (unchanged layout)
  // -----------------------
  const adminView = (
    <div className="events-page-student">
      {headerSection}

      <div className="filter-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <p className="no-events">No events found</p>
        ) : (
          filteredEvents.map((event) => {
            const preCount = event.registrationCount ?? null;
            return (
              <div key={event._id || event.id} className="event-card">
                <img
                  src={event.image || "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg"}
                  alt={event.title}
                />
                <div className="event-info" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p>📅 {event.date ? new Date(event.date).toLocaleDateString() : "—"}</p>
                    <p>🕒 {event.time || "—"}</p>
                    <p>📍 {event.venue || "—"}</p>
                    <p>Category: {event.category || "—"}</p>
                  </div>

                  <div
                    className="btn-group"
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: "auto",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="icon-btn"
                      onClick={() => navigate("/create-event", { state: { event, isEdit: true } })}
                    >
                      <FaEdit />
                      <span className="tooltip-text">Edit</span>
                    </button>

                    <button className="icon-btn" onClick={() => handleViewRegistrations(event)}>
                      <FaUsers />
                      <span className="tooltip-text">View Registrations</span>
                    </button>

                    <button className="icon-btn delete-icon-btn" onClick={() => triggerDeleteEvent(event)}>
                      <FaTrash />
                      <span className="tooltip-text">Delete</span>
                    </button>

                    {preCount !== null && (
                      <span className="badge" style={{ marginLeft: 6, whiteSpace: "nowrap" }}>
                        {preCount} regs
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

 
  const categorizeEvents = () => {
    const now = new Date();
    const past = [];
    const ongoing = [];
    const upcoming = [];

    filteredEvents.forEach((event) => {
      if (!event.date) return;
      const eventDate = new Date(event.date);
      const eventTime = event.time || "00:00";
      const [hours, minutes] = eventTime.split(":").map(Number);
      const eventDateTime = new Date(eventDate);
      eventDateTime.setHours(hours, minutes, 0, 0);

      const isToday = eventDate.toDateString() === now.toDateString();
      const timeDiff = eventDateTime - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (eventDateTime < now && hoursDiff < -2) {
        past.push(event);
      } else if (isToday && hoursDiff >= -2 && hoursDiff <= 4) {
        ongoing.push(event);
      } else if (eventDateTime > now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    return { past, ongoing, upcoming };
  };

  const { past, ongoing, upcoming } = categorizeEvents();

  const EventCategorySection = ({ title, events, colorClass }) => {
    if (events.length === 0) return null;
    return (
      <div className="events-category-section">
        <h3 className={`category-header ${colorClass}`}>
          {title} ({events.length})
        </h3>
        <div className="events-grid">
          {events.map((event) => {
            const registered = registrations.some((r) => {
              const eid = r.eventId?._id || r.eventId || r.event;
              const e1 = typeof eid === "object" ? (eid._id || eid.id) : eid;
              return String(e1) === String(event._id || event.id);
            });
            return (
              <div key={event._id || event.id} className="event-card">
                <img
                  src={event.image || "https://img.freepik.com/free-vector/hackathon-illustration_23-2148883451.jpg"}
                  alt={event.title}
                />
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p>📅 {event.date ? new Date(event.date).toLocaleDateString() : "—"}</p>
                  <p>🕒 {event.time || "—"}</p>
                  <p>📍 {event.venue || "—"}</p>
                  <p>Category: {event.category || "—"}</p>
                  <button
                    className={`btn ${registered ? "btn-disabled" : ""}`}
                    disabled={registered}
                    onClick={() => {
                      if (!registered) navigate("/event-registration", { state: { event } });
                    }}
                    style={{ width: "160px", marginTop: 12 }}
                  >
                    {registered ? "Registered" : "Register Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const studentViewInner = (
    <>
      <div className="filter-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="events-categorized-container" style={{ marginTop: 20 }}>
        <EventCategorySection title="Upcoming Events" events={upcoming} colorClass="upcoming" />
        <EventCategorySection title="Ongoing Events" events={ongoing} colorClass="ongoing" />
        <EventCategorySection title="Past Events" events={past} colorClass="past" />
        {filteredEvents.length === 0 && <p className="no-events">No events found</p>}
      </div>
    </>
  );

  const handleBellClick = () => {
    if (!student?.email) return;
    const approved = getApprovedIds();
    const seen = JSON.parse(localStorage.getItem(seenKey(student.email))) || [];
    const newSeen = Array.from(new Set([...seen, ...approved]));
    localStorage.setItem(seenKey(student.email), JSON.stringify(newSeen));
    setUnseenApprovedIds([]); // visually clear
    setShowNotifDropdown((s) => !s);
  };


  useEffect(() => {
    if (showRegsModal || showDeleteModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showRegsModal, showDeleteModal]);

  if (userRole === "admin") {
    return (
      <AdminLayout currentPath={location.pathname} onNavigate={(p) => navigate(p)}>
        {adminView}

        {/* Registrations Modal (admin) */}
        {showRegsModal && (
          <div className="modal-overlay" onClick={closeRegsModal}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                    Registrations for <span style={{ fontWeight: 700 }}>{selectedEvent?.title}</span>
                  </h3>
                  <div style={{ color: "#6b7280", fontSize: "0.95rem", marginTop: 6 }}>
                    {regsLoading ? "Loading..." : `${eventRegs.length} registration${eventRegs.length !== 1 ? "s" : ""}`}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Search registrations..."
                    value={regSearch}
                    onChange={(e) => {
                      setRegSearch(e.target.value);
                      setRegPage(1);
                    }}
                    className="search-input"
                    style={{ width: 260, padding: "8px 12px" }}
                  />

                  <button className="sort-btn" onClick={exportRegistrationsPDF} title="Export PDF">
                    Export PDF
                  </button>

                  <button className="btn" onClick={closeRegsModal}>
                    Close
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                {regsLoading ? (
                  <p>Loading registrations...</p>
                ) : eventRegs.length === 0 ? (
                  <p>No registrations for this event.</p>
                ) : (
                  <>
                    <div style={{ overflowX: "auto" }}>
                      <table className="registrations-table">
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>College</th>
                            <th>Registered At</th>
                            <th style={{ width: 110 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRegs.map((r, idx) => {
                            const studentR = r.student || r.user || {};
                            const name = studentR.name || r.studentName || r.name || `${studentR.firstName || ""} ${studentR.lastName || ""}`.trim() || "—";
                            const email = studentR.email || r.studentEmail || r.email || "—";
                            const college = r.collegeName || r.college || r.institution || "—";
                            const date = r.createdAt || r.registeredAt || r.timestamp || "";
                            const registeredAt = date ? new Date(date).toLocaleString() : "—";
                            const regId = r._id || r.id || "";

                            return (
                              <tr key={regId || idx}>
                                <td>{(regPage - 1) * REGS_PER_PAGE + idx + 1}</td>
                                <td>{name}</td>
                                <td>{email}</td>
                                <td>{college}</td>
                                <td>{registeredAt}</td>
                                <td>
                                  <button
                                    className="btn"
                                    onClick={() => {
                                      closeRegsModal();
                                      navigate(`/admin/registrations?highlight=${regId}`);
                                    }}
                                    style={{ padding: "6px 10px" }}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <div style={{ color: "#6b7280" }}>
                        Showing {(regPage - 1) * REGS_PER_PAGE + 1} -{" "}
                        {Math.min(regPage * REGS_PER_PAGE, filteredEventRegs.length)} of {filteredEventRegs.length}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="sort-btn" onClick={() => setRegPage((p) => Math.max(1, p - 1))} disabled={regPage === 1}>
                          Prev
                        </button>
                        <div style={{ alignSelf: "center", color: "#374151" }}>
                          Page {regPage} / {totalPages}
                        </div>
                        <button className="sort-btn" onClick={() => setRegPage((p) => Math.min(totalPages, p + 1))} disabled={regPage === totalPages}>
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (admin) */}
        {showDeleteModal && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteTarget(null);
            }}
          >
            <div className="modal confirm-delete" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Confirm Delete</h3>
              </div>

              <div className="confirm-body" style={{ marginTop: 12 }}>
                <p className="confirm-message" style={{ fontSize: "1rem", color: "#374151", lineHeight: 1.5 }}>
                  Are you sure you want to delete the event
                  <br />
                  <strong style={{ color: "#111827" }}>{deleteTarget?.title}</strong>
                  <br />
                  This action cannot be undone.
                </p>

                <div className="confirm-actions" style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTarget(null);
                    }}
                    style={{ minWidth: 120, background: "#e5e7eb", color: "#111827" }}
                  >
                    No
                  </button>

                  <button
                    className="btn"
                    style={{ minWidth: 140, background: "#dc2626", color: "#fff" }}
                    onClick={handleDeleteEvent}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    );
  }

  return (
    <StudentLayout currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}>
    <div >
     
    
        
        {/* Header (keeps simple title per option 2) */}
        <div className="registrations-header">
          <h2>Discover Exciting Events</h2>
          <p>Browse and register for upcoming activities & programs</p>
        </div>

        <div className="registrations-container page-inner">
          {/* Student inner content */}
          {studentViewInner}
        </div>
      </div>

      
  
    </StudentLayout>
  );
};

export default EventsPage;
