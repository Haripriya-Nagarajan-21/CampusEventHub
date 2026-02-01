import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/EventsPage.css";
import AdminLayout from "../Pages/AdminLayout";
import StudentLayout from "./StudentLayout";
import api from "../config/axios"; // ✅ IMPORTANT

import { FaEdit, FaUsers, FaTrash } from "react-icons/fa";
import { notifySuccess, notifyError } from "../utils/toast";

const EventsPage = ({ userRole = "student" }) => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();
  const location = useLocation();

  const student = JSON.parse(localStorage.getItem("user"));

  /* =====================================================
     ✅ FETCH EVENTS (FIXED)
  ===================================================== */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events/all");
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEvents([]);
      }
    };

    fetchEvents();
  }, []);

  /* =====================================================
     ✅ FETCH STUDENT REGISTRATIONS (FIXED)
  ===================================================== */
  useEffect(() => {
    if (!student?.email) return;

    const fetchRegs = async () => {
      try {
        const res = await api.get(`/registrations/student/${student.email}`);
        setRegistrations(res.data?.registrations || []);
      } catch {
        setRegistrations([]);
      }
    };

    fetchRegs();
  }, [student?.email]);

  /* =====================================================
     ✅ DELETE EVENT (FIXED)
  ===================================================== */
  const handleDeleteEvent = async (event) => {
    const id = event._id || event.id;

    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) =>
        prev.filter((e) => String(e._id || e.id) !== String(id))
      );
      notifySuccess("Event deleted successfully");
    } catch {
      notifyError("Failed to delete event");
    }
  };

  /* =====================================================
     ✅ VIEW REGISTRATIONS (FIXED)
  ===================================================== */
  const handleViewRegistrations = async (event) => {
    try {
      const res = await api.get("/registrations");
      const all = res.data?.registrations || [];

      const filtered = all.filter(
        (r) =>
          String(r.eventId?._id || r.eventId) ===
          String(event._id || event.id)
      );

      console.log("Registrations:", filtered);
      notifySuccess(`${filtered.length} registrations found`);
    } catch {
      notifyError("Failed to load registrations");
    }
  };

  /* =====================================================
     FILTER + SORT
  ===================================================== */
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      );
  }, [events, searchTerm, sortOrder]);

  /* =====================================================
     ADMIN VIEW
  ===================================================== */
  const adminView = (
    <div className="events-page">
      <h2>Manage Events</h2>

      <input
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}>
        Sort
      </button>

      <div className="events-grid">
        {filteredEvents.map((event) => (
          <div key={event._id} className="event-card">
            <h3>{event.title}</h3>
            <p>{event.date}</p>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/create-event", { state: { event, isEdit: true } })}>
                <FaEdit />
              </button>

              <button onClick={() => handleViewRegistrations(event)}>
                <FaUsers />
              </button>

              <button onClick={() => handleDeleteEvent(event)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* =====================================================
     STUDENT VIEW
  ===================================================== */
  const studentView = (
    <div className="events-page">
      <h2>Upcoming Events</h2>

      <div className="events-grid">
        {filteredEvents.map((event) => {
          const registered = registrations.some(
            (r) =>
              String(r.eventId?._id || r.eventId) ===
              String(event._id || event.id)
          );

          return (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>
              <p>{event.date}</p>

              <button
                disabled={registered}
                onClick={() =>
                  navigate("/event-registration", { state: { event } })
                }
              >
                {registered ? "Registered" : "Register"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ===================================================== */

  if (userRole === "admin") {
    return (
      <AdminLayout
        currentPath={location.pathname}
        onNavigate={(p) => navigate(p)}
      >
        {adminView}
      </AdminLayout>
    );
  }

  return (
    <StudentLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
    >
      {studentView}
    </StudentLayout>
  );
};

export default EventsPage;
