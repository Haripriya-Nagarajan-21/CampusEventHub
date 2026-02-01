import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/VerifyOtp.css";
import otpIllustration from "../assets/Forgot password-pana 1.svg";
import { notifyError, notifyInfo, notifySuccess } from "../utils/toast";
import api from "../config/axios"; // ✅ USE GLOBAL API

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  /* ================= TIMER ================= */
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  /* ================= INPUT HANDLING ================= */
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = otp.join("").trim();

    if (!email) return notifyError("Email not found. Please go back.");
    if (code.length !== 4) return notifyInfo("Enter the 4-digit code.");

    try {
      // ✅ FIXED HERE
      await api.post("/auth/verify-otp", { email, code });

      localStorage.setItem("resetEmail", email);

      notifySuccess("OTP verified successfully!");
      navigate("/reset-password");
    } catch (err) {
      notifyError(err.response?.data?.message || "Invalid OTP");
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);

    try {
      // ✅ FIXED HERE
      await api.post("/auth/forgot-password", { email });

      notifySuccess("OTP resent to your email");

      setTimer(30);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      notifyError("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => navigate("/forgot-password");

  /* ================= UI ================= */
  return (
    <div className="verify-wrapper">
      {/* LEFT */}
      <div className="verify-left">
        <div className="verify-form">
          <h2>Verification</h2>
          <p className="verify-subtitle">
            Enter your 4-digit code sent to your email.
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
            Didn't receive code?{" "}
            <span
              onClick={timer === 0 && !isResending ? handleResend : undefined}
              className={`resend-link ${timer > 0 ? "disabled" : ""}`}
            >
              {isResending ? "Resending..." : "Resend"}
            </span>
          </p>

          <button onClick={handleBack} className="back-button">
            ← Back
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="verify-right">
        <img src={otpIllustration} alt="Verification" />
      </div>
    </div>
  );
};

export default VerifyOtp;
