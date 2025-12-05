import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ForgotPassword.css";
import forgotPasswordIllustration from "../assets/Forgot password-pana 1.svg";
import { notifyError, notifySuccess } from "../utils/toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError("");
    // setMessage("");

    // ✅ Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      notifyError("Please enter your email address");
      return;
    }
    if (!emailRegex.test(email)) {
      notifyError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
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

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="forgot-password-wrapper">
      {/* Left Section - Form */}
      <div className="forgot-password-left">
        <div className="forgot-password-form">
          <h2>Forgot Password</h2>
          <p className="forgot-password-subtitle">
            Enter your email for the verification process. We'll send a 4-digit
            code to your email.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? "input-error" : ""}
              disabled={isLoading}
            />
            {error && <span className="error-message">{error}</span>}
            {message && <span className="success-message">{message}</span>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Continue"}
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
            Back to Login
          </button>
        </div>
      </div>

      {/* Right Section - Illustration */}
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
