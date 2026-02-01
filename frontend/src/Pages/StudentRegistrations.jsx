import React, { useEffect, useState } from "react";
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
import api from "../config/axios"; // ✅ USE GLOBAL API

const StudentRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [student, setStudent] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored?.email) return navigate("/login");
    setStudent(stored);
  }, [navigate]);

  /* ================= FETCH REGISTRATIONS ================= */
  useEffect(() => {
    if (!student?.email) return;

    const load = async () => {
      try {
        // ✅ FIXED HERE
        const { data } = await api.get(
          `/registrations/student/${student.email}`
        );

        const regs = data.registrations || [];

        setRegistrations(
          regs.map((r) => {
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

    load();
  }, [student?.email]);

  /* ================= DELETE ================= */
  const confirmDelete = (id) => {
    setRegistrationToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!registrationToDelete) return;

    setDeleting(true);

    try {
      // ✅ FIXED HERE
      await api.delete(`/registrations/${registrationToDelete}`);

      setRegistrations((prev) =>
        prev.filter((r) => r._id !== registrationToDelete)
      );
    } catch {
      alert("Delete failed");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setRegistrationToDelete(null);
    }
  };

  /* ================= FEEDBACK ================= */
  const handleFeedback = (eventId) => {
    navigate(`/student/feedback/${eventId}`);
  };

  /* ================= UI CARD ================= */
  const EventCard = ({ reg }) => {
    const isApproved = reg.status === "Approved";

    return (
      <div className="registration-card">
        <img src={reg.eventId?.image} alt="" />

        <div className="registration-info">
          <h4>{reg.eventId?.title}</h4>

          <p>📅 {new Date(reg.eventId?.date).toLocaleDateString()}</p>
          <p>🕒 {reg.eventId?.time}</p>
          <p>📍 {reg.eventId?.venue}</p>

          <div className="status-row">
            {reg.status === "Approved" && (
              <span className="status-approved">
                <FaCheckCircle /> Approved
              </span>
            )}
            {reg.status === "Pending" && (
              <span className="status-pending">
                <FaClock /> Pending
              </span>
            )}
            {reg.status === "Rejected" && (
              <span className="status-rejected">
                <FaTimes /> Rejected
              </span>
            )}

            <div className="inline-actions">
              <button onClick={() => confirmDelete(reg._id)}>
                <FaTrash />
              </button>

              <button
                disabled={!isApproved}
                onClick={() => handleFeedback(reg.eventId?._id)}
              >
                <FaCommentDots />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!student) return <h2>Loading...</h2>;

  return (
    <StudentLayout currentPath={location.pathname}>
      <div className="registrations-container">
        {registrations.length === 0 ? (
          <p>No registrations found</p>
        ) : (
          <div className="registrations-grid">
            {registrations.map((r) => (
              <EventCard key={r._id} reg={r} />
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <h3>Delete Registration?</h3>

            <button onClick={() => setDeleteModalOpen(false)}>No</button>

            <button onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes"}
            </button>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentRegistrations;
