import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../components/useNetworkStatus";
import DisplayListSection from "../components/DisplayListSection";
import { toast } from "react-toastify";
import { store, persistor } from "../redux/store";
import useDailyISTCleanup from "../hooks/useDailyISTCleanup";

export default function TaskDetail() {
  const {
    Store,
    ActivityID,
    StoreID,
    ScheduleID,
    SupplierID,
    Supplier,
    Activity,
    Duration,
    DOWork,
  } = useParams();
  
  useDailyISTCleanup(store, persistor);
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();

  const task = useSelector((state) =>
    state.tasks.tasks.find(
      (t) => {
        return String(t.ScheduleID) === String(ScheduleID) &&
        String(t.StoreID) === String(StoreID);
      },
    ),
  );

  const displays = task?.displays || [];

  const auth = localStorage.getItem("auth");

  useEffect(() => {
    if (auth !== "true") {
      localStorage.removeItem("auth");
      localStorage.removeItem("id");
      navigate("/");
    }
  }, [auth]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div
        className="top-header fixed-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="store-title">
          {localStorage.getItem("StoreName") || Store || ""}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "10px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <button
            style={{
              backgroundColor: "rgb(228, 60, 60)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => {
              localStorage.removeItem("auth");
              localStorage.removeItem("id");
              toast.error("Logout successful!");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Task Info Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "24px 0 16px 0",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 4px 16px rgba(34,197,94,0.10)",
            padding: "16px 24px 12px 24px",
            minWidth: "220px",
            maxWidth: "340px",
            textAlign: "center",
            fontWeight: 600,
            color: "#189918",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#189918",
              marginBottom: "2px",
              letterSpacing: "0.5px",
            }}
          >
            {Supplier}
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "#374151",
              marginBottom: "4px",
            }}
          >
            {Activity}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#10b981",
              background: "#f3f4f6",
              borderRadius: "8px",
              padding: "6px 14px",
              marginTop: "2px",
              boxShadow: "0 1px 4px rgba(16,185,129,0.04)",
            }}
          >
            Hrs Book: {Duration} hrs
          </div>
        </div>
      </div>

      {/* Display List Section */}
      <DisplayListSection
        ActivityID={ActivityID}
        StoreID={StoreID}
        ScheduleID={ScheduleID}
        displayList={displays}
        loadingDisplayList={false}
        DOWork={DOWork}
        SupplierID={SupplierID}
      />

      {/* Fallback message */}
      {displays.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            margin: "32px 0",
            fontWeight: 500,
            fontSize: 18,
          }}
        >
          {isOnline
            ? "No data available for this task."
            : "No offline data available. Please connect to the internet and refresh once."}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "white",
    minHeight: "100vh",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#374151",
  },
};