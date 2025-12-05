import React from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaClipboardList,
  FaComments,
  FaFileAlt,
} from "react-icons/fa";

const Sidebar = ({ sidebarOpen = false, closeSidebar = () => {}, onNavigate = () => {}, currentPath }) => {
  const resolvedPath = currentPath || (typeof window !== "undefined" ? window.location.pathname : "/admin");

  const menuItems = [
    { path: "/admin", icon: FaHome, label: "Dashboard" },
    { path: "/admin/events", icon: FaCalendarAlt, label: "Events" },
    { path: "/admin/registrations", icon: FaClipboardList, label: "Registrations" },
    { path: "/admin/feedbacks", icon: FaComments, label: "Feedback" },
    { path: "/admin/activity", icon: FaFileAlt, label: "Activity Log" },
  ];

  const handleNavigation = (path) => {
    onNavigate(path);
    if (window.innerWidth <= 1100) {
      closeSidebar();
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>College Admin</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/admin"
              ? resolvedPath === "/admin"
              : resolvedPath === item.path || resolvedPath.startsWith(item.path + "/");

          return (
            <li
              key={item.path}
              className={isActive ? "active" : ""}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon /> {item.label}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
