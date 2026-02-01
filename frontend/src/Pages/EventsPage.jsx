import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import "../Styles/EventsPage.css";
import AdminLayout from "../Pages/AdminLayout";
import StudentLayout from "./StudentLayout";
import api from "../config/axios"; // ✅ ONLY ADDED

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

const EventsPage = ({ userRole = "student" }) => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ["All", "This Week", "Technical", "Sports", "Workshop", "Cultural"];
  const [activeCategory, setActiveCategory] = useState("All");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegs, setEventRegs] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [showRegsModal, setShowRegsModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [regSearch, setRegSearch] = useState("");
  const [regPage, setRegPage] = useState(1);
  const REGS_PER_PAGE = 8;

  const modalRef = useRef(null);

  /* ================= LOAD STUDENT ================= */
  useEffect(() => {
    if (userRole === "student") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return navigate("/login");
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.email) return navigate("/login");
        setStudent(parsedUser);
      } catch {
        navigate("/login");
      }
    }
  }, [navigate, userRole]);

  /* ================= FETCH EVENTS ================= */
  useEffect(() => {
    api
      .get("/events/all") // ✅ changed
      .then((res) => {
        const data = res.data;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => setEvents([]));
  }, []);

  /* ================= FETCH STUDENT REGISTRATIONS ================= */
  useEffect(() => {
    if (!student?.email) return;

    api
      .get(`/registrations/student/${student.email}`) // ✅ changed
      .then((res) => {
        const data = res.data;

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

  /* ================= DELETE EVENT ================= */
  const handleDeleteEvent = async () => {
    const event = deleteTarget;
    if (!event) return;

    const id = event._id || event.id;

    try {
      const res = await api.delete(`/events/${id}`); // ✅ changed
      const data = res.data;

      if (data.success || data.message) {
        setEvents((prev) =>
          prev.filter((e) => String(e._id || e.id) !== String(id))
        );
        notifySuccess("Event deleted successfully");
      } else {
        notifyError(data.message || "Failed to delete");
      }
    } catch {
      notifyError("Network error while deleting event");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  /* ================= VIEW REGISTRATIONS (ADMIN) ================= */
  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event);
    setShowRegsModal(true);
    setRegsLoading(true);

    try {
      const res = await api.get("/registrations"); // ✅ changed
      const data = res.data;

      const allRegs = data.registrations || data || [];

      const eventId = event._id || event.id;

      const filtered = allRegs.filter(
        (r) =>
          String(r.eventId?._id || r.eventId) === String(eventId)
      );

      setEventRegs(filtered);
    } catch {
      setEventRegs([]);
    } finally {
      setRegsLoading(false);
    }
  };

  /* ================= FILTER EVENTS ================= */
  const filteredEvents = events
    .filter((event) => {
      const term = searchTerm.toLowerCase();
      return (
        (event.title || "").toLowerCase().includes(term) ||
        (event.category || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );

  /* ================= ADMIN VIEW ================= */
  if (userRole === "admin") {
    return (
      <AdminLayout
        currentPath={location.pathname}
        onNavigate={(p) => navigate(p)}
      >
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event._id} className="event-card">
              <img src={event.image} alt="" />

              <div className="event-info">
                <h3>{event.title}</h3>

                <div className="btn-group">
                  <button onClick={() => handleViewRegistrations(event)}>
                    <FaUsers />
                  </button>

                  <button onClick={() => setDeleteTarget(event)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  /* ================= STUDENT VIEW ================= */
  return (
    <StudentLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
    >
      <div className="events-grid">
        {filteredEvents.map((event) => {
          const registered = registrations.some(
            (r) => r.eventId?._id === event._id
          );

          return (
            <div key={event._id} className="event-card">
              <img src={event.image} alt="" />

              <div className="event-info">
                <h3>{event.title}</h3>

                <button
                  disabled={registered}
                  onClick={() =>
                    navigate("/event-registration", { state: { event } })
                  }
                >
                  {registered ? "Registered" : "Register Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </StudentLayout>
  );
};

export default EventsPage;
