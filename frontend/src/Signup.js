import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    orgId: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.userId) newErrors.userId = "User ID is required";
    if (!formData.orgId) newErrors.orgId = "Organization ID is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      navigate("/dashboard"); 
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div style={container}>
      <motion.div
        style={backgroundWrapper}
        animate={{ rotate: [-10, -5, -10] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
      >
        <div style={backgroundText}>SENTRY</div>
      </motion.div>

      {/* Glass Card */}
      <motion.div
        style={formCard}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={title}>Sign Up</h2>
        <form onSubmit={handleSubmit} style={form}>
          {["userId", "orgId", "password"].map((field) => (
            <div key={field} style={{ marginBottom: "1rem" }}>
              <input
                type={field === "password" ? "password" : "text"}
                placeholder={
                  field === "userId"
                    ? "User ID"
                    : field === "orgId"
                    ? "Organization ID"
                    : "Password"
                }
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                style={{
                  ...inputField,
                  border: errors[field] ? "1px solid rgba(255,0,0,0.6)" : "none",
                }}
              />
              {errors[field] && <p style={errorText}>{errors[field]}</p>}
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={glassButton}
            type="submit"
          >
            Create Account
          </motion.button>
        </form>
        <p style={switchText}>
          Already have an account?{" "}
          <span style={linkText} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;


const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #1f2937, #111827)",
  position: "relative",
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

const formCard = {
  zIndex: 1,
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(12px)",
  padding: "3rem 2rem",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  textAlign: "center",
  width: "350px",
};

const title = {
  color: "white",
  marginBottom: "1.5rem",
  fontSize: "1.8rem",
};

const form = { display: "flex", flexDirection: "column" };

const inputField = {
  width: "100%",
  padding: "12px 3px",
  borderRadius: "12px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "1rem",
  transition: "0.3s",
};

const errorText = {
  color: "#ff6b6b",
  fontSize: "0.8rem",
  marginTop: "4px",
  textAlign: "left",
};

const glassButton = {
  marginTop: "1rem",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  background:
    "linear-gradient(135deg, rgba(99, 102, 241, 0.7), rgba(236, 72, 153, 0.7))",
  color: "white",
  fontSize: "1rem",
  fontWeight: "600",
  transition: "0.3s",
};

const switchText = { color: "white", marginTop: "1rem", fontSize: "0.9rem" };
const linkText = { color: "#60a5fa", cursor: "pointer", fontWeight: "600" };
