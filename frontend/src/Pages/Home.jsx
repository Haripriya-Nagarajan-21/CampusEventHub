// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import "../Styles/Home.css";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  // check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  // save theme
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleNavClick = (link) => {
    setActiveLink(link);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className={`home-wrapper ${isDarkMode ? "dark" : ""}`}>
      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => handleNavClick("home")}>
            CampusEventHub
          </div>
        </div>

        {/* CENTER LINKS (Desktop only) */}
        <div className="nav-center">
          <a className={activeLink === "home" ? "active" : ""} onClick={() => handleNavClick("home")}>Home</a>
          <a className={activeLink === "events" ? "active" : ""} onClick={() => handleNavClick("events")}>Events</a>
          <a className={activeLink === "about" ? "active" : ""} onClick={() => handleNavClick("about")}>About</a>
          <a className={activeLink === "contact" ? "active" : ""} onClick={() => handleNavClick("contact")}>Contact</a>
        </div>

        {/* RIGHT SIDE */}
        <div className="nav-right">
          {/* 🌙/☀ ICON THEME SWITCH */}
          <div className="home-theme-icon" onClick={toggleTheme}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </div>

          {!isLoggedIn ? (
            <div className="nav-actions">
              <button onClick={() => navigate("/login")} className="btn-outline">Login</button>
              <button onClick={() => navigate("/signup")} className="btn-primary">Sign Up</button>
            </div>
          ) : (
            <button className="btn-primary dashboard-btn" onClick={() => navigate("/student-dashboard")}>
              Dashboard
            </button>
          )}

          <div className={`nav-toggle ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a onClick={() => handleNavClick("home")}>Home</a>
          <a onClick={() => handleNavClick("events")}>Events</a>
          <a onClick={() => handleNavClick("about")}>About</a>
          <a onClick={() => handleNavClick("contact")}>Contact</a>

          <div className="nav-actions-mobile">
            {!isLoggedIn ? (
              <>
                <button onClick={() => { setMenuOpen(false); navigate("/login"); }} className="btn-outline">Login</button>
                <button onClick={() => { setMenuOpen(false); navigate("/signup"); }} className="btn-primary">Sign Up</button>
              </>
            ) : (
              <>
                <button className="btn-primary" onClick={() => { setMenuOpen(false); navigate("/student-dashboard"); }}>Dashboard</button>
                <button className="btn-outline logout-btn" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-left">
          <h1>Connect, Compete & <span>Celebrate</span></h1>
          <p>Discover and participate in exciting college events. Connect with peers, explore opportunities, and create memorable experiences.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/signup")}>Join as Student</button>
            <button className="btn-outline" onClick={() => navigate("/signup")}>Register College</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-wrapper">
            <img src="https://img.freepik.com/free-vector/flat-university-concept-background_52683-11176.jpg?semt=ais_hybrid&w=740&q=80" alt="Events Illustration" />
            <div className="hero-glow" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why CampusEventHub?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src="https://img.freepik.com/free-vector/happy-tiny-business-people-dancing-having-fun-drinking-wine-corporate-party-team-building-activity-corporate-event-idea-concept-pinkish-coral-bluevector-isolated-illustration_335657-1414.jpg?semt=ais_incoming&w=740&q=80" />
            <h3>Explore Unlimited Events</h3>
            <p>Browse events from multiple colleges and find what interests you.</p>
          </div>

          <div className="feature-card">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1ltPl5FLsN4O_0RpqCHSXyMwGqySQRfN6iy5Y50M1XsiG7obul9cAhW36CBXGQkEjSBU&usqp=CAU" />
            <h3>Compete With Students</h3>
            <p>Participate and compete with students across universities.</p>
          </div>

          <div className="feature-card">
            <img src="https://img.freepik.com/premium-vector/talent-concept-talented-tiny-woman-big-star-smartphone-screen-super-staropen-your-potential_501813-972.jpg" />
            <h3>Showcase Your Talents</h3>
            <p>Build your profile and stand out through performances & skills.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 CampusEventHub — All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
