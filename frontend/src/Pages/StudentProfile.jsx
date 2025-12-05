import React, { useEffect, useState } from "react";
import StudentLayout from "./StudentLayout";
import "../Styles/StudentProfile.css";
import {
  FaEnvelope,
  FaUniversity,
  FaUserEdit,
} from "react-icons/fa";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    college: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setStudent(user);
      setEditData(user);
    }

    const getRegs = async () => {
      const res = await fetch(
        `http://localhost:5000/api/registrations/student/${user.email}`
      );
      const data = await res.json();
      setRegistrations(data.registrations || []);
    };

    getRegs();
  }, []);

  const filtered =
    activeTab === "All"
      ? registrations
      : registrations.filter((r) => r.status === activeTab);

 const saveProfile = () => {
  localStorage.setItem("user", JSON.stringify(editData));
  setStudent(editData);
  window.dispatchEvent(new Event("storage"));
  setEditOpen(false);
};

  if (!student) return <h2>Loading...</h2>;

  return (
    <StudentLayout>
      <div className="profile-page">

        {/* PROFILE CARD */}
        <div className="profile-card enhanced-profile-card">
          <div className="profile-left">
            <div className="avatar-circle big-avatar">
              {student.fullName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="profile-name">{student.fullName}</h2>
              <p><FaEnvelope /> {student.email}</p>
              <p><FaUniversity /> {student.college}</p>
            </div>
          </div>

          <button
            className="edit-profile-btn modern-edit-btn"
            onClick={() => setEditOpen(true)}
          >
            <FaUserEdit /> Edit Profile
          </button>
        </div>

        {/* STATS */}
        <div className="stats-container new-stats">
          <div className="stat-box">
            <h3>{registrations.length}</h3>
            <p>Total Events</p>
          </div>
          <div className="stat-box">
            <h3>{registrations.filter((r) => r.status === "Approved").length}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-box">
            <h3>{registrations.filter((r) => r.status === "Pending").length}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-box">
            <h3>{registrations.filter((r) => r.status === "Rejected").length}</h3>
            <p>Rejected</p>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="tabs modern-tabs">
          {["All", "Approved", "Pending", "Rejected"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* EVENTS GRID */}
        <div className="events-grid improved-grid">
          {filtered.length === 0 ? (
            <p className="no-events">No events found.</p>
          ) : (
            filtered.map((r) => (
              <div className="event-card upgraded-event" key={r._id}>
                <img
                  className="event-image"
                  src={
                    r.eventId?.image ||
                    "https://img.freepik.com/free-vector/event-concept-illustration_114360-931.jpg"
                  }
                  alt="Event"
                />

                <div className="event-details">
                  <h3 className="event-title">{r.eventId?.title}</h3>

                  <div className="event-meta">
                    <span>📅 {new Date(r.eventId?.date).toLocaleDateString()}</span>
                    <span>⏰ {r.eventId?.time || "TBA"}</span>
                  </div>

                  {/* STATUS CHIP */}
                  <span
                    className={`status-chip status-${r.status.toLowerCase()}`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* EDIT MODAL */}
        {editOpen && (
          <div className="edit-overlay">
            <div className="edit-modal modern-modal">

              <h3>Edit Profile</h3>

              <label>Full Name</label>
              <input
                value={editData.fullName}
                onChange={(e) =>
                  setEditData({ ...editData, fullName: e.target.value })
                }
              />

              <label>Email</label>
              <input
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />

              <label>College</label>
              <input
                value={editData.college}
                onChange={(e) =>
                  setEditData({ ...editData, college: e.target.value })
                }
              />

              <div className="modal-buttons">
                <button className="save-btn" onClick={saveProfile}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
