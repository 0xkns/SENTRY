import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaUpload, FaSearch, FaEye } from "react-icons/fa";

function Dashboard() {
  return (
    <div style={dashboardContainer}>
      <div style={sidebarStyle}>
        <h2 style={{ color: "white", marginBottom: "40px", fontSize: "1.5rem" }}>
          SENTRY
        </h2>

        <NavLink
          to="upload"
          style={({ isActive }) =>
            isActive ? activeMenuItem : menuItemStyle
          }
        >
          <FaUpload size={20} style={{ marginRight: "10px" }} />
          Upload
        </NavLink>

        <NavLink
          to="search"
          style={({ isActive }) =>
            isActive ? activeMenuItem : menuItemStyle
          }
        >
          <FaSearch size={20} style={{ marginRight: "10px" }} />
          Search
        </NavLink>

        <NavLink
          to="demo"
          style={({ isActive }) =>
            isActive ? activeMenuItem : menuItemStyle
          }
        >
          <FaEye size={20} style={{ marginRight: "10px" }} />
          Demo
        </NavLink>
      </div>

      <div style={mainContentStyle}>
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;


const dashboardContainer = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "'Poppins', sans-serif",
  background: "linear-gradient(135deg, #1f2937, #111827)",
};

const sidebarStyle = {
  width: "220px",
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(12px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "30px 20px",
  borderTopRightRadius: "20px",
  borderBottomRightRadius: "20px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
};

const menuItemStyle = {
  display: "flex",
  alignItems: "center",
  color: "white",
  padding: "12px 15px",
  borderRadius: "12px",
  cursor: "pointer",
  marginBottom: "10px",
  fontWeight: "500",
  transition: "0.3s",
  width: "100%",
  background: "transparent",
  textDecoration: "none",
};

const activeMenuItem = {
  ...menuItemStyle,
  background: "rgba(255, 255, 255, 0.15)",
  fontWeight: "600",
};

const mainContentStyle = {
  flex: 1,
  padding: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
};
