import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaStar, FaRegStar, FaTrash } from "react-icons/fa";

import AdminLayout from "../Pages/AdminLayout";
import "../Styles/AdminFeedback.css";
import api from "../config/axios"; // ONLY change

const AdminFeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* =====================
     ONLY axios logic
  ===================== */
  const fetchFeedbacks = async () => {
    try {
      const res = await api.get("/feedback");
      setFeedbacks(res.data.feedbacks || []);
    } catch {
      toast.error("Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/feedback/${deleteTarget._id}`);
      toast.success("Deleted successfully");

      setFeedbacks((prev) =>
        prev.filter((f) => f._id !== deleteTarget._id)
      );
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowModal(false);
      setDeleteTarget(null);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) =>
      i < rating ? <FaStar key={i} color="#f59e0b" /> : <FaRegStar key={i} color="#f59e0b" />
    );

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();

    return (
      f.name?.toLowerCase().includes(t) ||
      f.email?.toLowerCase().includes(t) ||
      f.eventId?.title?.toLowerCase().includes(t) ||
      f.comments?.toLowerCase().includes(t)
    );
  });

  if (loading) {
    return (
      <AdminLayout currentPath={location.pathname}>
        <h2 style={{ textAlign: "center", marginTop: 50 }}>Loading...</h2>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPath={location.pathname} onNavigate={(p) => navigate(p)}>
      <div className="admin-feedback-container">
        <ToastContainer />

        {/* SEARCH (same class) */}
        <input
          type="text"
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="feedback-search-input"
        />

        {/* TABLE (same structure) */}
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Event</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredFeedbacks.map((f) => (
              <tr key={f._id}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.eventId?.title}</td>
                <td>{renderStars(f.rating)}</td>
                <td>{f.comments}</td>
                <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => {
                      setDeleteTarget(f);
                      setShowModal(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SAME OLD MODAL */}
        {showModal && deleteTarget && (
          <div className="modal-overlay">
            <div className="feedback-delete-modal">
              <p>Delete this feedback?</p>
              <button onClick={handleDelete}>Delete</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;
