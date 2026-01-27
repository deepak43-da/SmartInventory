import React from "react";

export default function Header({ title, onReload, showFooter = true }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      <button
        onClick={onReload}
        style={{
          marginLeft: 16,
          padding: "8px 12px",
          borderRadius: 6,
          background: "#f3f4f6",
          border: "none",
          cursor: "pointer",
        }}
      >
        Reload
      </button>
      {!showFooter ? null : (
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "#eee",
            padding: "8px",
            textAlign: "center",
          }}
        >
          Footer
        </footer>
      )}
    </header>
  );
}
