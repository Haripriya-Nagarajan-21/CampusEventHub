import React, { useState, useEffect } from "react";
import "../Styles/AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "./AdminLayout";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    pendingApprovals: 0,
  });
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
    else navigate("/login");

    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/stats");
        const data = await res.json();
        setStats({
          totalEvents: Number(data?.totalEvents) || 0,
          activeEvents: Number(data?.activeEvents) || 0,
          totalRegistrations: Number(data?.totalRegistrations) || 0,
          pendingApprovals: Number(data?.pendingApprovals) || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchActivity = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/activity");
        const data = await res.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    fetchStats();
    fetchActivity();
  }, [navigate]);

  if (!user) return null;

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
    >

      <main >
        {/* Header */}
        <section className="modern-header">
          <div className="welcome-text">
            <h2>
              {getGreeting()}, <span>{user.fullName}</span> 👋
            </h2>
            <p>Welcome back to your admin dashboard. Here's your quick summary.</p>
          </div>
          <div className="create-btn-container">
            <button
              className="create-event-btn"
              onClick={() => navigate("/create-event")}
            >
              + Create Event
            </button>
          </div>
        </section>

        {/* ✅ Stats Section */}
        <div className="stats-grid">
          <div className="card">
            <p>Total Events</p>
            <h2>{stats.totalEvents}</h2>
            <h5>All time events created</h5>
          </div>
          <div className="card">
            <p>Active Events</p>
            <h2>{stats.activeEvents}</h2>
            <h5>Currently open for registration</h5>
          </div>
          <div className="card">
            <p>Total Registrations</p>
            <h2>{stats.totalRegistrations}</h2>
            <h5>Across all events</h5>
          </div>
          <div className="card">
            <p>Pending Approvals</p>
            <h2>{stats.pendingApprovals}</h2>
            <h5>Awaiting admin review</h5>
          </div>
        </div>

        {/* ✅ Recent Activity + Quick Actions */}
        <div className="panel-container">
          <div className="panel">
            <h3>Recent Activity</h3>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.length > 0 ? (
                  activities.map((act, i) => (
                    <tr key={i}>
                      <td>{act.eventName}</td>
                      <td>{act.action}</td>
                      <td>{new Date(act.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No recent activity found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Quick Actions */}
          <div className="panel quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button
                className="blue-btn"
                onClick={() => navigate("/create-event")}
              >
                + Create New Event
              </button>
              <button
                className="gray-btn"
                onClick={() => navigate("/admin/registrations")}
              >
                Review Approvals
              </button>
              <button
                className="gray-btn"
                onClick={() => navigate("/admin/events")}
              >
                Active Events
              </button>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
