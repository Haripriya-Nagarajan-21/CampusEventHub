import { useState } from "react";
import "../styles/login.css";
import loginImage from "../assets/login-illustration.svg";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { notifySuccess, notifyError } from "../utils/toast";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      notifyError("Please enter both email and password!");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // ✅ Save token & user details
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      notifySuccess("Login successful!");

      // ✅ Role-based navigation
      const role = response.data.user.role?.toLowerCase();

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "faculty") {
        navigate("/faculty-dashboard");
      } else {
        navigate("/"); // fallback
      }

      // ✅ Reset form
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });
    } catch (err) {
      console.error("Login Error:", err);
      notifyError(
        err.response?.data?.message || "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Forgot Password
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // ✅ Go to Signup
  const handleCreateAccount = () => {
    navigate("/signup");
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-form">
          <h2>Login</h2>

          <p className="subtitle">
            Don't have an account?{" "}
            <span onClick={handleCreateAccount} className="link">
              Create now
            </span>
          </p>

          <form onSubmit={handleSubmit}>
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
            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
              >
                {showPassword ? (
                   <FaRegEye size={20} color="#666" />
                 
                ) : (
                  <FaRegEyeSlash size={20} color="#666" />
                )}
              </button>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="remember-forgot-row">
              <div className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              <span onClick={handleForgotPassword} className="forgot-link">
                Forgot Password?
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Section (Illustration) */}
      <div className="login-right">
        <img src={loginImage} alt="Students illustration" />
      </div>
    </div>
  );
}

export default Login;
