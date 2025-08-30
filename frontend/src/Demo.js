import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Highlighter from "react-highlight-words";


const generateGibberish = (length = 8) => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

function Demo() {
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);


  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [data, setData] = useState([]);

  const acceptedTypes = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  const maxFileSize = 20 * 1024 * 1024;

  const onDrop = useCallback((acceptedFiles, rejections) => {
    setErrorMsg("");
    if (rejections.length > 0) {
      const msg = rejections
        .map(({ file, errors }) => errors.map((e) => `${file.name} - ${e.message}`).join(", "))
        .join("; ");
      setErrorMsg(msg);
    }
    setFiles((cur) => [...cur, ...acceptedFiles.map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: maxFileSize,
    multiple: true,
  });

  const removeFile = (file) => setFiles((cur) => cur.filter((f) => f !== file));

  const simulateUpload = () => {
    if (files.length === 0 && !textInput.trim()) {
      setErrorMsg("Please upload a file(s) or paste some text first!");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    let progress = 0;

    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        const newDocs = files.map((f) => ({
          type: "File",
          content: f.name,
          date: new Date().toISOString().slice(0, 10),
        }));
        if (textInput.trim()) {
          newDocs.push({
            type: "Text",
            content: textInput.trim(),
            date: new Date().toISOString().slice(0, 10),
          });
        }
        setData((prev) => [...prev, ...newDocs]);
        setFiles([]);
        setTextInput("");
        setUploadProgress(0);
      }
    }, 300);
  };


  const filteredData = useMemo(() => {
    if (!hasSearched) return [];
    let docs = [...data];
    if (searchQuery.trim()) {
      docs = docs.filter((d) => d.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return docs;
  }, [searchQuery, hasSearched, data]);

  return (
    <div style={containerStyle}>
      <motion.div style={cardStyle} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 style={titleStyle}>Demo: Secure Search & Upload</h1>

        {/* Upload Section */}
        <div {...getRootProps()} style={uploadBoxStyle}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop files here...</p> : <p>Drag & drop or click to select (20MB max)</p>}
        </div>

        {files.length > 0 && (
          <ul style={{ textAlign: "left", color: "white" }}>
            {files.map((file, idx) => (
              <li key={idx}>
                {file.name} <button onClick={() => removeFile(file)}>x</button>
              </li>
            ))}
          </ul>
        )}

        <textarea
          placeholder="Or paste text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={textAreaStyle}
        />

        <motion.button onClick={simulateUpload} style={uploadButton}>
          {uploading ? "Uploading..." : "Upload & Scramble"}
        </motion.button>
        {uploadProgress > 0 && <progress value={uploadProgress} max="100" style={{ width: "100%", marginTop: "10px" }} />}

        {/* Show search only after upload */}
        {data.length > 0 && (
          <>
            <input
              type="text"
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
            <motion.button
              onClick={() => setHasSearched(true)}
              style={uploadButton}
            >
              Search
            </motion.button>
          </>
        )}

        {/* Results only after searching */}
        {hasSearched && (
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            {/* User View */}
            <div style={resultBox}>
              <h3>👤 User View</h3>
              {filteredData.length === 0 ? (
                <p>No results found</p>
              ) : (
                filteredData.map((res, idx) => (
                  <p key={idx}>
                    <strong>{res.type}:</strong>{" "}
                    <Highlighter
                      searchWords={[searchQuery]}
                      textToHighlight={res.content}
                      highlightStyle={{ background: "yellow" }}
                    />
                  </p>
                ))
              )}
            </div>

            {/* Attacker View */}
            <div style={resultBox}>
              <h3>🕵️ Attacker View</h3>
              {filteredData.map((res, idx) => (
                <p key={idx} style={{ color: "#2ecc71" }}>
                  {generateGibberish(res.content.length)}
                </p>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Demo;


const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #1f2937, #111827)",
  fontFamily: "'Poppins', sans-serif",
  padding: "40px",
};
const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(12px)",
  padding: "40px",
  borderRadius: "20px",
  width: "800px",
  color: "white",
};
const titleStyle = { fontSize: "2rem", marginBottom: "20px" };
const uploadBoxStyle = {
  padding: "20px",
  border: "2px dashed rgba(255,255,255,0.4)",
  borderRadius: "12px",
  color: "white",
  marginBottom: "20px",
  cursor: "pointer",
};
const textAreaStyle = { width: "100%", padding: "10px", borderRadius: "12px", marginBottom: "20px" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "12px", marginTop: "20px", marginBottom: "20px" };
const uploadButton = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, rgba(99,102,241,0.7), rgba(236,72,153,0.7))",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "10px",
};
const resultBox = { flex: 1, padding: "15px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", minHeight: "150px" };
