import React, { useEffect, useState } from "react";
import "../Styles/ActivityLog.css"; // We will create this file
import AdminLayout from "../Pages/AdminLayout";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../config/axios"; // ✅ ONLY ADDED

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // ✅ ONLY CHANGED (fetch → api)
        const res = await api.get("/admin/activity");
        const data = res.data;

        setActivities(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    fetchActivity();
  }, []);

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
    >
      <div className="panel">
        <h3>Activity Log</h3>

        <div className="table-wrapper">
          <table className="activity-log-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {activities.length > 0 ? (
                activities.map((act, i) => (
                  <tr key={i}>
                    <td data-label="Event">{act.eventName}</td>
                    <td data-label="Action">{act.action}</td>
                    <td data-label="Time">
                      {new Date(act.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-activity-found">
                    No activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogPage;
