import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [sliderValue, setSliderValue] = useState(7);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receipts, setReceipts] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const acceptedTypes = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setErrorMsg("");
      if (fileRejections.length > 0) {
        const message = fileRejections
          .map(({ file, errors }) =>
            errors.map((e) => `${file.name} - ${e.message}`).join(", ")
          )
          .join("; ");
        setErrorMsg(message);
      }
      setFiles((current) => [
        ...current,
        ...acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: maxFileSize,
    multiple: true,
  });

  const removeFile = (file) => {
    setFiles((current) => current.filter((f) => f !== file));
  };

  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  const getSliderColor = (value) => {
    if (value <= 3) return "#e74c3c";
    if (value <= 7) return "#f1c40f";
    return "#2ecc71";
  };

  const getSensitivityText = (value) => {
    if (value <= 3) return "Public";
    if (value <= 7) return "Confidential";
    return "Restricted";
  };

  const fillPercentage = ((sliderValue - 1) / 9) * 100;

  // Fixed simulateUpload function
  const simulateUpload = async () => {
    if (files.length === 0 && !textInput.trim()) {
      setErrorMsg("Please upload a file(s) or paste some text first!");
      return;
    }
    setErrorMsg("");
    setUploading(true);
    setUploadProgress(0);

    try {
      // Prepare document content (simple: join file names or text input)
      let content = textInput;
      if (files.length > 0) {
        // In real app: read file contents, not just names
        content = files.map((f) => f.name).join(", ");
      }

      const token = localStorage.getItem("token"); // saved from login
      console.log("Using token:", token);

      const response = await fetch("http://localhost:8003/documents/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          org_id: 1,         // Changed to string to match backend schema
          title: "Uploaded Document",
          content: content,    // Fixed: use actual content, not hardcoded "content"
          sensitivity: sliderValue,
          acl_roles: ["employee"], // example roles
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();

      // Simulate upload animation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setUploading(false);
          setReceipts((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleString(),
              files: files.length > 0 ? files.map((f) => f.name) : ["Text input"],
              sliderValue,
              scrambled: true,
              docId: data.doc_id,
              chunks: data.chunks_created,
            },
          ]);
          setFiles([]);
          setTextInput("");
          alert("Upload and ingestion complete!");
          setUploadProgress(0);
        }
      }, 200);
    } catch (err) {
      console.error(err);
      setErrorMsg("Upload failed: " + err.message);
      setUploading(false);
    }
  };


  return (
    <div style={containerStyle}>
      <motion.div
        style={cardStyle}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={titleStyle}>Upload Document / Image</h1>

        <div
          {...getRootProps()}
          style={{
            ...uploadBoxStyle,
            border: isDragActive ? "3px solid #4a90e2" : uploadBoxStyle.border,
            backgroundColor: isDragActive ? "rgba(74, 144, 226, 0.1)" : uploadBoxStyle.background,
            transition: "border-color 0.3s, background-color 0.3s",
            marginBottom: "20px",
            cursor: "pointer",
          }}
          aria-label="File Upload Dropzone"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p style={{ margin: 0 }}>Drop the files here ...</p>
          ) : (
            <p style={{ margin: 0 }}>Drag & drop files here, or click to select files (20MB max)</p>
          )}
        </div>

        {errorMsg && (
          <p style={{ color: "#FF4136", marginBottom: "14px", fontWeight: "600" }}>{errorMsg}</p>
        )}

        {files.length > 0 && (
          <div
            style={{
              maxHeight: "140px",
              overflowY: "auto",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "10px 15px",
              marginBottom: "20px",
              color: "white",
              fontSize: "14px",
            }}
          >
            <strong>Selected files:</strong>
            <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 8 }}>
              {files.map((file, idx) => (
                <li
                  key={file.path || idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: idx !== files.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none",
                    padding: "6px 0",
                  }}
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(file)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      lineHeight: "1",
                    }}
                    title={`Remove ${file.name}`}
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          placeholder="Or paste text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={textAreaStyle}
          rows={4}
          aria-label="Paste text here"
        />

        <div style={{ margin: "25px 0", position: "relative" }}>
          <label style={sliderLabel}>
            Privacy Level: {sliderValue} ({getSensitivityText(sliderValue)})
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={sliderValue}
            onChange={handleSliderChange}
            style={{
              ...sliderStyle,
              background: `linear-gradient(to right, ${getSliderColor(
                sliderValue
              )} 0%, ${getSliderColor(sliderValue)} ${fillPercentage}%, #555 ${fillPercentage}%, #555 100%)`,
              color: getSliderColor(sliderValue),
            }}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={sliderValue}
            aria-label="Privacy level slider"
          />
          <div
            style={{
              position: "absolute",
              left: `calc(${fillPercentage}% - 18px)`,
              top: "-28px",
              color: getSliderColor(sliderValue),
              fontWeight: "600",
              background: "rgba(0,0,0,0.3)",
              padding: "2px 6px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              userSelect: "none",
            }}
          >
            {sliderValue * 10}%
          </div>
        </div>

        <motion.button
          style={uploadButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={simulateUpload}
          disabled={uploading}
          aria-disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload & Scramble"}
        </motion.button>

        {uploadProgress > 0 && (
          <progress
            value={uploadProgress}
            max="100"
            style={{
              width: "100%",
              height: "14px",
              borderRadius: "8px",
              marginTop: "20px",
              marginBottom: "10px",
              appearance: "none",
            }}
            aria-label="Upload progress"
          />
        )}

        <div style={receiptsContainerStyle} aria-live="polite" aria-atomic="true">
          <h3 style={{ marginTop: 0, color: "white" }}>Privacy Receipts</h3>
          {receipts.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>No uploads yet.</p>
          ) : (
            receipts.map((receipt, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px",
                  borderBottom: idx === receipts.length - 1 ? "none" : "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                }}
              >
                <div>
                  <strong>Timestamp:</strong> {receipt.timestamp}
                </div>
                <div>
                  <strong>Files:</strong> {receipt.files.join(", ")}
                </div>
                <div>
                  <strong>Privacy Level:</strong>{" "}
                  <span style={{ color: getSliderColor(receipt.sliderValue) }}>
                    {getSensitivityText(receipt.sliderValue)} ({receipt.sliderValue})
                  </span>
                </div>
                <div>
                  <strong>Scrambled:</strong> {receipt.scrambled ? "Yes" : "No"}
                </div>
              </div>
            ))
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard/search")}
          aria-label="Go to Search Page"
          style={{ ...uploadButton, marginTop: "20px" }}
        >
          Go to Search Page
        </motion.button>
      </motion.div>
    </div>
  );
}

export default UploadPage;

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #1f2937, #111827)",
  fontFamily: "'Poppins', sans-serif",
  padding: "20px",
};

const cardStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(12px)",
  padding: "40px 35px",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  textAlign: "center",
  width: "500px",
};

const titleStyle = {
  marginBottom: "25px",
  color: "white",
  fontSize: "1.8rem",
};

const uploadBoxStyle = {
  padding: "40px",
  border: "2px dashed rgba(255,255,255,0.4)",
  borderRadius: "12px",
  color: "white",
  marginBottom: "20px",
  background: "rgba(255,255,255,0.05)",
  userSelect: "none",
};

const textAreaStyle = {
  width: "100%",
  minHeight: "100px",
  padding: "12px 15px",
  borderRadius: "12px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "1rem",
  marginBottom: "20px",
  resize: "vertical",
};

const sliderLabel = {
  display: "block",
  marginBottom: "10px",
  color: "white",
  fontWeight: "600",
};

const sliderStyle = {
  width: "100%",
  height: "12px",
  borderRadius: "6px",
  appearance: "none",
  outline: "none",
  cursor: "pointer",
};

const uploadButton = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, rgba(99,102,241,0.7), rgba(236,72,153,0.7))",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  transition: "0.3s",
  marginTop: "10px",
};

const receiptsContainerStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.1)",
  borderRadius: "15px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  color: "white",
  marginTop: "20px",
  maxHeight: "220px",
  overflowY: "auto",
  textAlign: "left",
  fontSize: "14px",
};
