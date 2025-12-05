import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyOtp from "./Pages/VerifyOtp";
import ResetPassword from "./Pages/ResetPassword";
import AdminDashboard from "./Pages/AdminDashboard";
import StudentDashboard from "./Pages/StudentDashboard";
import CreateEvent from "./Pages/CreatEvent";
import EventsPage from "./Pages/EventsPage";
import RegistrationsPage from "./Pages/RegistrationsPage";
import FeedbackPage from "./Pages/FeedbackPage";
import ActivityLogPage from "./Pages/ActivityLogPage";
import EventRegistration from "./Pages/EventRegistration";

import AdminFeedbackPage from "./Pages/AdminFeedbackPage";
import StudentRegistrations from "./Pages/StudentRegistrations";
import StudentProfile from "./Pages/StudentProfile";


function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.text())
      .then(setMessage);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard/>}/>
        <Route path="/admin/events" element={<EventsPage userRole="admin" />} />
        <Route path="/student/events" element={<EventsPage userRole="student" />} />
        <Route path="/student/feedback/:eventId" element={<FeedbackPage />} />
        <Route path="/admin/registrations" element={<RegistrationsPage />} />
        <Route path="/student/registrations" element={<StudentRegistrations />} />
        <Route path="/admin/feedbacks" element={<AdminFeedbackPage />} />
        <Route path="/admin/activity" element={<ActivityLogPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard/>}/>
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/event-registration" element={<EventRegistration />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
