import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import "../styles/signup.css";
import signupImage from "../assets/college students-amico.svg";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { notifySuccess, notifyError, notifyWarn } from "../utils/toast";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student", // default
    college: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle confirm password field
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 Password validations
    if (formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      notifyError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long!");
      notifyWarn("Password must be at least 6 characters long!");
      return;
    }

    try {
      // ✅ Prepare data (role in lowercase for backend)
      const payload = { ...formData, role: formData.role.toLowerCase() };

      // ✅ Send signup request
      await api.post("/auth/signup", payload);

      notifySuccess("Signup successful! Please log in to continue.");

      // ✅ Clear user info (just in case)
      localStorage.removeItem("user");

      // ✅ Reset form fields
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "Student",
        college: "",
      });
      setConfirmPassword("");

      // ✅ Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Signup Error:", err);
      notifyError(err.response?.data?.message || "Error signing up");
    }
  };

  // ✅ Navigate to login manually
  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="signup-wrapper">
      {/* Left section - form */}
      <div className="signup-left">
        <div className="signup-form">
          <h2>Sign Up</h2>
          <p className="login-link">
            Already have an account?{" "}
            <span onClick={goToLogin} className="link">
              Login
            </span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              aria-label="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              aria-label="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Password */}
            <div className="signup-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="signup-password-input"
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaRegEye size={20} color="#666" />
                ) : (
                  <FaRegEyeSlash size={20} color="#666" />
                )}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="signup-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="signup-password-input"
              />
              <span
                className="eye-icon"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <FaRegEye size={20} color="#666" />
                ) : (
                  <FaRegEyeSlash size={20} color="#666" />
                )}
              </span>
            </div>

            {/* Role */}
            <select
              name="role"
              aria-label="Role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Admin">Admin</option>
            </select>

            {/* College */}
            <input
              type="text"
              name="college"
              placeholder="College/University"
              aria-label="College or University"
              value={formData.college}
              onChange={handleChange}
              required
            />

            <button type="submit">Sign Up</button>
          </form>
        </div>
      </div>

      {/* Right section - image */}
      <div className="signup-right">
        <img src={signupImage} alt="Students illustration" />
      </div>
    </div>
  );
}

export default Signup;
