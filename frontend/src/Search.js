import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Highlighter from "react-highlight-words";
import Select from "react-select";
import { saveAs } from "file-saver";

const dummyData = [
  { type: "Document", content: "React Tutorial for Beginners", privacy: "Public", date: "2024-01-10" },
  { type: "Document", content: "Advanced Node.js Techniques", privacy: "Confidential", date: "2023-10-22" },
  { type: "Image", content: "React Logo", privacy: "Public", date: "2022-12-13" },
  { type: "Image", content: "Node.js Logo", privacy: "Restricted", date: "2024-05-30" },
  { type: "Text", content: "Learn React step by step", privacy: "Public", date: "2023-11-12" },
  { type: "Text", content: "Node.js event loop explained", privacy: "Confidential", date: "2024-03-18" },
];

const privacyOptions = [
  { value: "Public", label: "Public" },
  { value: "Confidential", label: "Confidential" },
  { value: "Restricted", label: "Restricted" },
];

const sortOptions = [
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
  { value: "date_asc", label: "Date (Oldest)" },
  { value: "date_desc", label: "Date (Newest)" },
];

const PAGE_SIZE = 3;

function SearchPage() {
  const [inputQuery, setInputQuery] = useState("");
  const [selectedPrivacy, setSelectedPrivacy] = useState([]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]); // backend results
  const [error, setError] = useState("");      // error messages

  const navigate = useNavigate();

  const actionButtonStyle = (disabled = false) => ({
    minWidth: "160px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, rgba(99,102,241,0.7), rgba(236,72,153,0.7))",
    color: "white",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "1rem",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: "background 0.3s, opacity 0.3s",
    opacity: disabled ? 0.7 : 1,
    margin: "0 0.5rem",
  });

  // Filter dummyData only if you want to fallback when no backend search yet
  const filteredData = useMemo(() => {
    if (!hasSearched || results.length > 0) return results; // show backend results if available

    let docs = [...dummyData];
    if (inputQuery.trim()) {
      docs = docs.filter((item) =>
        item.content.toLowerCase().includes(inputQuery.toLowerCase())
      );
    }
    if (selectedPrivacy.length > 0) {
      const vals = selectedPrivacy.map((o) => o.value);
      docs = docs.filter((doc) => vals.includes(doc.privacy));
    }
    switch (sortBy.value) {
      case "title_asc":
        docs = docs.sort((a, b) => a.content.localeCompare(b.content));
        break;
      case "title_desc":
        docs = docs.sort((a, b) => b.content.localeCompare(a.content));
        break;
      case "date_asc":
        docs = docs.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date_desc":
        docs = docs.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        break;
    }
    return docs;
  }, [inputQuery, selectedPrivacy, sortBy, hasSearched, results]);

  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedDocs = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    let rows = [
      ["Type", "Content", "Privacy", "Date"].map((h) => `"${h}"`).join(","),
      ...filteredData.map((doc) =>
        [doc.type, doc.content, doc.privacy, doc.date].map((val) => `"${val}"`).join(",")
      )
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    saveAs(blob, "search_results.csv");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleButtonMouseOver = (e) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.background =
        "linear-gradient(135deg, rgba(99,102,241,0.84), rgba(236,72,153,0.84))";
    }
  };

  const handleButtonMouseOut = (e) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.background =
        "linear-gradient(135deg, rgba(99,102,241,0.7), rgba(236,72,153,0.7))";
    }
  };

  const onSearchClick = async () => {
    if (inputQuery.trim() === "") {
      setHasSearched(false);
      setPage(1);
      return;
    }

    try {
      setError(""); // reset error
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8003/documents/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: inputQuery,
          purpose: "general",
          max_chunks: 3,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Query failed");
      }

      const data = await res.json();
      console.log("Backend results:", data);

      setHasSearched(true);
      setPage(1);

      // Map backend answer to UI format
      setResults([
        {
          type: "Answer",
          content: data.answer || "No answer returned",
          privacy: "Backend",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "An unexpected error occurred");
      setResults([]);
      setHasSearched(true);
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
        <h1 style={titleStyle}>Search</h1>
        <input
          type="text"
          placeholder="Enter search query..."
          value={inputQuery}
          onChange={(e) => {
            const val = e.target.value;
            setInputQuery(val);
            if (val.trim() === "") {
              setHasSearched(false);
              setResults([]);
              setPage(1);
              setError("");
            }
          }}
          style={inputStyle}
          autoComplete="off"
        />
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <Select
            options={privacyOptions}
            isMulti
            placeholder="Filter by Privacy"
            value={selectedPrivacy}
            onChange={(selected) => setSelectedPrivacy(selected || [])}
            styles={{ container: (base) => ({ ...base, flex: 1 }) }}
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(option) => setSortBy(option)}
            styles={{ container: (base) => ({ ...base, flex: 1 }) }}
          />
        </div>
        <motion.button
          style={actionButtonStyle(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSearchClick}
          onMouseOver={handleButtonMouseOver}
          onMouseOut={handleButtonMouseOut}
        >
          Search
        </motion.button>

        {hasSearched && (
          <>
            <div style={{ marginTop: "20px", textAlign: "left" }}>
              {error ? (
                <p style={{ color: "red", fontStyle: "italic" }}>
                  Error: {error}
                </p>
              ) : paginatedDocs.length === 0 ? (
                <p style={{ color: "white", fontStyle: "italic" }}>
                  No results found
                </p>
              ) : (
                paginatedDocs.map((res, idx) => (
                  <motion.div
                    key={idx}
                    style={resultStyle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <strong style={{ color: "#f9fafb" }}>{res.type}:</strong>{" "}
                    <Highlighter
                      searchWords={[inputQuery]}
                      autoEscape={true}
                      textToHighlight={res.content}
                      highlightStyle={{ backgroundColor: "yellow", color: "#333" }}
                    />
                    <div style={{ fontSize: "12px", marginTop: "4px", color: "#e5e7eb" }}>
                      Privacy: {res.privacy} | Date: {res.date}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {pageCount > 1 && !error && (
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", margin: "22px 0 8px" }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  style={paginationButtonStyle}
                >
                  Prev
                </button>
                <span style={{ alignSelf: "center", color: "#fff", fontWeight: 600 }}>
                  Page {page} of {pageCount}
                </span>
                <button
                  disabled={page === pageCount}
                  onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
                  style={paginationButtonStyle}
                >
                  Next
                </button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px", gap: "1rem" }}>
              <button
                onClick={handleExportCSV}
                disabled={filteredData.length === 0}
                style={actionButtonStyle(filteredData.length === 0)}
                onMouseOver={handleButtonMouseOver}
                onMouseOut={handleButtonMouseOut}
              >
                Export Results as CSV
              </button>
              <button
                onClick={handleLogout}
                style={actionButtonStyle(false)}
                onMouseOver={handleButtonMouseOver}
                onMouseOut={handleButtonMouseOut}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default SearchPage;

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  width: "100%",
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
  width: "600px",
  maxWidth: "100%",
};

const titleStyle = {
  fontSize: "1.8rem",
  marginBottom: "25px",
  color: "white",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  borderRadius: "12px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "1rem",
  marginBottom: "20px",
};

const resultStyle = {
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "white",
};

const paginationButtonStyle = {
  background: "#4a90e2",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  cursor: "pointer",
  fontWeight: "600",
};
