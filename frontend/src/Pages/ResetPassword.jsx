import React, { useState, useEffect } from "react";
import "../styles/ResetPassword.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import resetPasswordImage from "../assets/Forgot password-pana 1.svg";
import { notifyError, notifyInfo, notifySuccess } from "../utils/toast";  

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Get email from localStorage (stored after OTP verification)
  const [email, setEmail] = useState("");
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      notifyError("Email not found. Please restart the password reset process.");
      setTimeout(() => navigate("/forgot-password"), 2000);
    }
  }, [navigate]);

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
 

    if (!password || !confirmPassword) {
      notifyInfo("Please fill both fields");
      return;
    }

    if (password.length < 6) {
      notifyError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      notifyError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // ✅ Call backend reset-password API
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email,
          newPassword: password,
        }
      );

      notifySuccess(response.data.message || "Password updated successfully!");

      // ✅ Remove email from localStorage
      localStorage.removeItem("resetEmail");

      // ✅ Navigate to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/verify-otp", { state: { email } });
  };

  return (
    <div className="password-wrapper">
      {/* Left Section - Form */}
      <div className="password-left">
        <div className="password-form">
          <h2>New Password</h2>
          <p className="password-subtitle">
            Set the new password for your account so you can login and access
            all features.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="password-wrapper-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaRegEye size={20} color="#666" />
                ) : (
                  <FaRegEyeSlash size={20} color="#666" />
                )}
              </button>
            </div>

            <div className="password-wrapper-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaRegEye size={20} color="#666" />
                ) : (
                  <FaRegEyeSlash size={20} color="#666" />
                )}
              </button>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <button onClick={handleBack} className="back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="password-right">
        <img src={resetPasswordImage} alt="Reset Password Illustration" />
      </div>
    </div>
  );
};

export default ResetPassword;
