import React from "react";

export default function Header({ title, onReload, showFooter = true }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        background: "var(--purple-main)",
        color: "var(--text-light)",
        boxShadow: "0 2px 4px rgba(124,58,237,0.08)",
      }}
    >
      <h2 style={{ margin: 0, color: "var(--text-light)" }}>{title}</h2>
      <button
        onClick={onReload}
        style={{
          marginLeft: 16,
          padding: "8px 12px",
          borderRadius: 6,
          background: "var(--purple-accent)",
          color: "var(--purple-dark)",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
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
            background: "var(--purple-light)",
            color: "var(--purple-dark)",
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
