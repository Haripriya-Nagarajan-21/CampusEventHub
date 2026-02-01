import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/ForgotPassword.css";
import forgotPasswordIllustration from "../assets/Forgot password-pana 1.svg";
import { notifyError, notifySuccess } from "../utils/toast";
import api from "../config/axios"; // ✅ USE AXIOS INSTANCE

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return notifyError("Please enter your email address");
    if (!emailRegex.test(email))
      return notifyError("Please enter a valid email address");

    setIsLoading(true);

    try {
      // ✅ FIXED
      await api.post("/auth/forgot-password", { email });

      notifySuccess(`Verification code sent to ${email}`);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      notifyError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper">
      {/* Left Section */}
      <div className="forgot-password-left">
        <div className="forgot-password-form">
          <h2>Forgot Password</h2>
          <p className="forgot-password-subtitle">
            Enter your email to receive a verification code.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Continue"}
            </button>
          </form>

          <button onClick={() => navigate("/login")} className="back-button">
            Back to Login
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="forgot-password-right">
        <img
          src={forgotPasswordIllustration}
          alt="Forgot Password Illustration"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
