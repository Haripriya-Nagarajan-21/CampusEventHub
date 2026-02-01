import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaStar, FaRegStar, FaTrash } from "react-icons/fa";
import api from "../config/axios";
import AdminLayout from "../Pages/AdminLayout";
import "../Styles/AdminFeedback.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const AdminFeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ==============================
     FETCH FEEDBACKS (AXIOS ONLY)
  ============================== */
  const fetchFeedbacks = async () => {
    try {
      const res = await api.get("/feedback"); // ✅ axios
      const data = res.data;

      if (data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        toast.error(data.message || "Failed to fetch feedbacks");
      }
    } catch {
      toast.error("Network error while fetching feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /* ==============================
     DELETE FEEDBACK (AXIOS ONLY)
  ============================== */
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await api.delete(`/feedback/${deleteTarget._id}`); // ✅ axios
      const data = res.data;

      if (data.success) {
        toast.success(data.message);
        setFeedbacks((prev) =>
          prev.filter((f) => f._id !== deleteTarget._id)
        );
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting feedback");
    } finally {
      setShowModal(false);
      setDeleteTarget(null);
    }
  };

  /* ==============================
     STARS
  ============================== */
  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) =>
      i < rating ? (
        <FaStar key={i} color="#f59e0b" />
      ) : (
        <FaRegStar key={i} color="#f59e0b" />
      )
    );

  /* ==============================
     SEARCH FILTER
  ============================== */
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

  /* ==============================
     ANALYTICS
  ============================== */
  const totalFeedback = feedbacks.length;

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
          feedbacks.length
        ).toFixed(1)
      : 0;

  const eventCount = {};
  feedbacks.forEach((f) => {
    const eventName = f.eventId?.title || "Unknown Event";
    eventCount[eventName] = (eventCount[eventName] || 0) + 1;
  });

  const mostRatedEvent =
    Object.entries(eventCount).length > 0
      ? Object.entries(eventCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const last7days = feedbacks.filter((f) => {
    const diff =
      (new Date() - new Date(f.createdAt)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
  }));

  /* ==============================
     CHART DATA
  ============================== */
  const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"];

  const pieData = ratingDistribution.map((r) => ({
    name: `${r.star} Star`, // ✅ fixed
    value: r.count,
  }));

  const eventBarData = Object.keys(eventCount).map((ev) => ({
    event: ev,
    count: eventCount[ev],
  }));

  const last7daysData = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));

    const count = feedbacks.filter(
      (f) =>
        new Date(f.createdAt).toLocaleDateString() ===
        day.toLocaleDateString()
    ).length;

    return {
      day: day.toLocaleDateString(),
      count,
    };
  });

  /* ============================== */

  if (loading) {
    return (
      <AdminLayout currentPath={location.pathname}>
        <h2 style={{ textAlign: "center", marginTop: 50 }}>
          Loading feedbacks...
        </h2>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
    >
      <div className="admin-feedback-container">
        <ToastContainer />

        {/* TABLE + UI EXACTLY SAME */}
        <table className="feedback-table">
          <tbody>
            {filteredFeedbacks.map((f) => (
              <tr key={f._id}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.eventId?.title}</td>
                <td>{renderStars(f.rating)}</td>
                <td>{f.comments}</td>
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
      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;
