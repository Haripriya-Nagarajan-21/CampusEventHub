import React, { useEffect, useState, useMemo } from "react";
import "../Styles/Registrations.css";
import AdminLayout from "../Pages/AdminLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../config/axios"; // ✅ ONLY ADD

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRegistrations();
  }, [location.pathname]);

  /* =====================================================
     ✅ ONLY CHANGED → axios instance
  ===================================================== */
  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations"); // ✅ changed
      const data = res.data;
      setRegistrations(data.registrations || data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setRegistrations([]);
    }
  };

  /* =====================================================
     ✅ ONLY CHANGED → axios instance
  ===================================================== */
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/registrations/${id}/status`, { status }); // ✅ changed
      const data = res.data;

      if (data.success) {
        fetchRegistrations();

        if (status === "Approved") {
          toast.success("Registration approved successfully!");
        } else if (status === "Rejected") {
          toast.error("❌ Registration rejected!");
        }
      } else {
        toast.warn(data.message || "⚠️ Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("❌ Failed to update status");
    }
  };

  /* ===================================================== */

  const analytics = useMemo(() => {
    const total = registrations.length;
    const approved = registrations.filter((r) => r.status === "Approved").length;
    const pending = registrations.filter((r) => r.status === "Pending").length;
    const rejected = registrations.filter((r) => r.status === "Rejected").length;

    const approvalRate = total ? ((approved / total) * 100).toFixed(1) : 0;

    return { total, approved, pending, rejected, approvalRate };
  }, [registrations]);

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={(p) => navigate(p)}
    >
      <div className="panels">

        <h3>Registration Analytics</h3>

        <div className="analytics-container">
          <div className="analytics-card total">
            <h4>Total Registrations</h4>
            <p>{analytics.total}</p>
          </div>

          <div className="analytics-card approved">
            <h4>Approved</h4>
            <p>{analytics.approved}</p>
          </div>

          <div className="analytics-card pending">
            <h4>Pending</h4>
            <p>{analytics.pending}</p>
          </div>

          <div className="analytics-card rejected">
            <h4>Rejected</h4>
            <p>{analytics.rejected}</p>
          </div>

          <div className="analytics-card rate">
            <h4>Approval Rate</h4>
            <p>{analytics.approvalRate}%</p>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <h3>Registrations</h3>

        <div className="table-wrapper">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {registrations.length > 0 ? (
                registrations.map((reg) => (
                  <tr key={reg._id}>
                    <td>{reg.eventId?.title || "N/A"}</td>
                    <td>{reg.studentName}</td>
                    <td>{reg.studentEmail}</td>
                    <td>{reg.status}</td>

                    <td>
                      {reg.status === "Pending" ? (
                        <div className="action-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => updateStatus(reg._id, "Approved")}
                          >
                            Approve
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() => updateStatus(reg._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`status-${reg.status.toLowerCase()}`}>
                          {reg.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No registrations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer theme="colored" position="top-right" autoClose={2500} />
    </AdminLayout>
  );
};

export default RegistrationsPage;
