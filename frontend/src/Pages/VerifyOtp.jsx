import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/VerifyOtp.css";
import otpIllustration from "../assets/Forgot password-pana 1.svg";
import { notifyError, notifyInfo, notifySuccess } from "../utils/toast";


const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Auto-focus input handling
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("").trim();

    if (!email) {
      notifyError("Email not found. Please go back.");
      return;
    }

    if (code.length !== 4) {
      notifyInfo("Enter the 4-digit code.");
      return;
    }

    try {
      console.log("Sending OTP:", code, "to backend for email:", email);
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, code }
      );
      localStorage.setItem("resetEmail", email);
      notifySuccess("OTP verified successfully!");
      navigate("/reset-password");
    } catch (err) {
      console.error(err.response?.data);
      notifyError(err.response?.data?.message || "Invalid OTP");
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });
      notifySuccess("OTP resent to your email");
      setTimer(30);
      setOtp(["", "", "", ""]); // clear inputs
      inputRefs.current[0].focus();
    } catch (err) {
      console.error(err.response?.data);
      notifyError("Failed to resend OTP. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="verify-wrapper">
      {/* Left Section - Form */}
      <div className="verify-left">
        <div className="verify-form">
          <h2>Verification</h2>
          <p className="verify-subtitle">
            Enter your 4-digit code that you received on your email.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  value={digit}
                  ref={(el) => (inputRefs.current[i] = el)}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="otp-box"
                />
              ))}
            </div>

            <p className="timer">{`00:${timer.toString().padStart(2, "0")}`}</p>

            <button type="submit">Continue</button>
          </form>

      
          <p className="resend">
            If you didn't receive a code?{" "}
            <span
              onClick={timer === 0 && !isResending ? handleResend : undefined}
              className={`resend-link ${timer > 0 ? "disabled" : ""}`}
            >
              {isResending ? "Resending..." : "Resend"}
            </span>
          </p>

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
      <div className="verify-right">
        <img src={otpIllustration} alt="Verification" />
      </div>
    </div>
  );
};

export default VerifyOtp;
