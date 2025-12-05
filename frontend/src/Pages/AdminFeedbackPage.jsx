import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar, FaRegStar, FaTrash, FaTimes } from "react-icons/fa";

import AdminLayout from "../Pages/AdminLayout";
import "../Styles/AdminFeedback.css";

// 📊 Import Charts
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

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/feedback");
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        toast.error(data.message || "Failed to fetch feedbacks");
      }
    } catch (err) {
      toast.error("Network error while fetching feedbacks");
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
      const res = await fetch(
        `http://localhost:5000/api/feedback/${deleteTarget._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message);
        setFeedbacks(feedbacks.filter((f) => f._id !== deleteTarget._id));
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting feedback");
    } finally {
      setShowModal(false);
      setDeleteTarget(null);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) =>
      i < rating ? (
        <FaStar key={i} color="#f59e0b" />
      ) : (
        <FaRegStar key={i} color="#f59e0b" />
      )
    );

  // Search Filter
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

  // =============================
  // 📊 ANALYTICS CALCULATIONS
  // =============================

  const totalFeedback = feedbacks.length;

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
          feedbacks.length
        ).toFixed(1)
      : 0;

  // Event count
  const eventCount = {};
  feedbacks.forEach((f) => {
    const eventName = f.eventId?.title || "Unknown Event";
    eventCount[eventName] = (eventCount[eventName] || 0) + 1;
  });

  const mostRatedEvent =
    Object.entries(eventCount).length > 0
      ? Object.entries(eventCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  // Last 7 days
  const last7days = feedbacks.filter((f) => {
    const diff =
      (new Date() - new Date(f.createdAt)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
  }));

  // =============================
  // 📊 CHART DATA
  // =============================

  const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"];

  // Pie chart: Rating distribution
  const pieData = ratingDistribution.map((r) => ({
    name: `${r.star} Star`,
    value: r.count,
  }));

  // Bar chart: Feedback per event
  const eventBarData = Object.keys(eventCount).map((ev) => ({
    event: ev,
    count: eventCount[ev],
  }));

  // Last 7 days trend
  const last7daysData = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));

    const dayStr = day.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const count = feedbacks.filter(
      (f) =>
        new Date(f.createdAt).toLocaleDateString() ===
        day.toLocaleDateString()
    ).length;

    return { day: dayStr, count };
  });

  // =============================

  if (loading) {
    return (
      <AdminLayout currentPath={location.pathname}>
        <h2 style={{ textAlign: "center", marginTop: "50px" }}>
          Loading feedbacks...
        </h2>
      </AdminLayout>
    );
  }

  return (
    
       <AdminLayout currentPath={location.pathname} onNavigate={(p) => navigate(p)}>
      <div className="admin-feedback-container">
        <ToastContainer />
        <div className="feedback-analytics">
          <h3>Feedback Analytics</h3>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Total Feedback</h4>
              <p>{totalFeedback}</p>
            </div>
            <div className="analytics-card">
              <h4>Average Rating</h4>
              <p>{averageRating} ⭐</p>
            </div>
            <div className="analytics-card">
              <h4>Most Rated Event</h4>
              <p>{mostRatedEvent}</p>
            </div>
            <div className="analytics-card">
              <h4>Last 7 Days</h4>
              <p>{last7days}</p>
            </div>
          </div>
        </div>

        {/* ======================
            📊 VISUAL CHARTS
        ====================== */}
        <div className="feedback-charts">
          <h3>Visual Analytics</h3>

          <div className="charts-grid">

            {/* Pie Chart */}
            <div className="chart-card">
              <h4 align="center">Rating Distribution</h4>
              <PieChart width={370} height={350}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            {/* Bar Chart: Event wise feedback */}
            <div className="chart-card">
              <h4 align="center">Feedback per Event</h4>
              <BarChart width={350} height={350} data={eventBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                  {eventBarData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={chartColors[i % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>

            {/* Bar Chart: Last 7 days */}
            <div className="chart-card">
              <h4 align="center">Feedback Last 7 Days</h4>
              <BarChart width={350} height={350} data={last7daysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </div>

          </div>
        </div>

        {/* ======================
            SEARCH BAR
        ====================== */}
        <div className="feedback-search-container">
          <input
            type="text"
            placeholder="Search by name, email, event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="feedback-search-input"
          />
        </div>

        {/* ======================
            FEEDBACK TABLE
        ====================== */}
        {filteredFeedbacks.length === 0 ? (
          <div className="feedback-empty">
            <p>No feedback found.</p>
          </div>
        ) : (
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Event</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Actions</th>
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
                  <td>
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="feedback-delete-btn"
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
        )}

        {/* ======================
        DELETE MODAL
        ====================== */}
        {showModal && deleteTarget && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="feedback-delete-modal" onClick={(e) => e.stopPropagation()}>
              
              <h3>Delete Feedback</h3>
              <p>
                Are you sure you want to delete feedback from{" "}
                <strong>{deleteTarget.name}</strong>?
              </p>
              <p className="modal-warning">This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="modal-delete-btn" onClick={handleDelete}>
                  Yes, Delete
                </button>
                <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminFeedbackPage;
