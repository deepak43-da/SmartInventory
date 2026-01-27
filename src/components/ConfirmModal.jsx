import React from "react";

export default function ConfirmModal({ message, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          minWidth: 300,
        }}
      >
        <p style={{ marginBottom: 24 ,width: 270 }}>{message}</p>
        <div style={{width: 270, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              background: "#eee",
              border: "none",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              background: "#10b981",
              color: "#fff",
              border: "none",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
