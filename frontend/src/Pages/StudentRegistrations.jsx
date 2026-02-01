// src/pages/StudentRegistrations.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/StudentRegistrations.css";
import {
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaTrash,
  FaCommentDots,
} from "react-icons/fa";
import StudentLayout from "./StudentLayout";
import api from "../config/axios"; // ✅ ONLY ADDED

const StudentRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [student, setStudent] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.email) return navigate("/login");

      setStudent(parsedUser);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  /* =====================================================
     ✅ FETCH REGISTRATIONS (axios only)
  ===================================================== */
  useEffect(() => {
    if (!student?.email) return;

    const fetchRegistrations = async () => {
      try {
        const res = await api.get(`/registrations/student/${student.email}`); // ✅ changed
        const data = res.data;

        setRegistrations(
          (data.registrations || data || []).map((r) => {
            const givenKey = `fb_${r.eventId?._id}_${student.email}`;
            const lockKey = `fb_lock_${r.eventId?._id}_${student.email}`;

            return {
              ...r,
              feedbackGiven: localStorage.getItem(givenKey) === "true",
              feedbackLocked: localStorage.getItem(lockKey) === "true",
            };
          })
        );
      } catch {
        setRegistrations([]);
      }
    };

    fetchRegistrations();
  }, [student?.email]);

  /* =====================================================
     ✅ DELETE REGISTRATION (axios only)
  ===================================================== */
  const handleDelete = async () => {
    if (!registrationToDelete) return;

    setDeleting(true);

    try {
      const res = await api.delete(`/registrations/${registrationToDelete}`); // ✅ changed
      const data = res.data;

      if (data.success) {
        setRegistrations((prev) =>
          prev.filter((r) => r._id !== registrationToDelete)
        );
      }
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setRegistrationToDelete(null);
    }
  };

  const confirmDelete = (id) => {
    setRegistrationToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleFeedback = (eventId) => {
    navigate(`/student/feedback/${eventId}`);
  };

  /* ================= FILTER ================= */
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

  const filtered = filterRegistrations(registrations);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!student) {
    return (
      <div className="loading-screen">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <StudentLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
    >
      <div>
        <div className="registrations-header">
          <h2>My Event Registrations</h2>
          <p>View all your registered events</p>
        </div>

        <div className="registrations-container">
          <div className="registrations-grid">
            {filtered.map((reg) => (
              <div className="registration-card" key={reg._id}>
                <img
                  src={reg.eventId?.image}
                  alt={reg.eventId?.title}
                />

                <div className="registration-info">
                  <h4>{reg.eventId?.title}</h4>

                  <p>📅 {new Date(reg.eventId?.date).toLocaleDateString()}</p>
                  <p>🕒 {reg.eventId?.time}</p>

                  <div className="status-row">
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

                    <div className="inline-actions">
                      <button onClick={() => confirmDelete(reg._id)}>
                        <FaTrash />
                      </button>

                      <button onClick={() => handleFeedback(reg.eventId?._id)}>
                        <FaCommentDots />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <h3>Confirm Deletion</h3>

            <button onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes"}
            </button>

            <button onClick={() => setDeleteModalOpen(false)}>No</button>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentRegistrations;
