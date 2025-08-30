import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "./logo.jpeg";


function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={container}>
      {/* Animated Abstract Background */}
      <motion.div
        style={backgroundWrapper}
        animate={{ rotate: [-15, -10, -15] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      >
        <div style={backgroundText}>SENTRY</div>
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        style={content}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
      <motion.img
          src={logo}
          alt="Sentry Logo"
          style={logoStyle}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
      />
        <h1 style={title}>
          Sentry 
        </h1>
        <br />
        <h2>Secure ENgine for Trusted RAG Yield</h2>
        <p style={subtitle}>Makes sure your AI assistant only sees what you are allowed to see — nothing more, nothing less — and always explains why!</p>
        
        <div style={buttonContainer}>
          {/* Glassmorphic Login Button */}
          <motion.button
            style={glassButtonGreen}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 25px rgba(67, 206, 162, 0.9)",
              backdropFilter: "blur(15px)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            Login
          </motion.button>

          {/* Glassmorphic Sign Up Button */}
          <motion.button
            style={glassButtonPink}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 25px rgba(255, 106, 0, 0.9)",
              backdropFilter: "blur(15px)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

const container = {
  position: "relative",
  height: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  overflow: "hidden",
  fontFamily: "'Poppins', sans-serif",
};

const backgroundWrapper = {
  position: "absolute",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 0,
  pointerEvents: "none",
};

const backgroundText = {
  fontSize: "22vw",
  fontWeight: "900",
  color: "rgba(255,255,255,0.05)",
  userSelect: "none",
  whiteSpace: "nowrap",
  lineHeight: "1",
};

const logoStyle = {
  width: "220px",       // Adjust size
  borderRadius: "20px", // Optional: soft edges
  boxShadow: "0 0 25px rgba(124, 255, 0, 0.7)", // Glow matching highlight
  border: "2px solid rgba(124, 255, 0, 0.5)",  // Subtle neon border
};


const content = {
  textAlign: "center",
  color: "#fff",
  zIndex: 1,
};

const title = {
  fontSize: "3.5rem",
  marginBottom: "10px",
  letterSpacing: "2px",
};

const subtitle = {
  fontSize: "1.2rem",
  marginBottom: "40px",
  opacity: 0.85,
};

const buttonContainer = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
};

const glassButtonBase = {
  padding: "14px 36px",
  borderRadius: "50px",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  color: "#fff",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};

const glassButtonGreen = {
  ...glassButtonBase,
  border: "2px solid rgba(67, 206, 162, 0.6)",
};

const glassButtonPink = {
  ...glassButtonBase,
  border: "2px solid rgba(255, 106, 0, 0.6)",
};

export default HomePage;
