import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../redux/actions/tasksActions";
import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import "./taskList.css";
import { toast } from "react-toastify";
import { useNetworkStatus } from "../components/useNetworkStatus";
import { store, persistor } from "../redux/store";
import useDailyISTCleanup from "../hooks/useDailyISTCleanup";
import Version from "../components/Version";

export default function TaskList() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useDailyISTCleanup(store, persistor);

  const { isOnline } = useNetworkStatus();
  const { queue = [], offlineImages = [] } = useSelector(
    (state) => state.tasks || {},
  );

  // Use displays from the converted API response
  const displays = useSelector((state) => state.tasks.tasks?.[0]?.displays || []);
  const loading = false; // Define missing loading variable
  // lazy loading state
  const [visibleCount, setVisibleCount] = useState(10);
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < displays.length) {
        setVisibleCount(prevCount => prevCount + 10);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, displays.length, visibleCount]);

  console.log(displays, "displays in TaskList");

  const handleLogout = () => {
    persistor.purge();
    localStorage.removeItem("auth");
    // localStorage.removeItem("id");
    localStorage.removeItem("StoreID");
    localStorage.removeItem("StoreName");
    localStorage.removeItem("Type");
    localStorage.removeItem("UserID");
    localStorage.removeItem("maindata");
    toast.error("Logout successful!");
    navigate("/");
  };

  // Remove isTaskActive and time logic, not needed for displays

  const auth = localStorage.getItem("auth");

  useEffect(() => {
    if (auth !== "true") {
      localStorage.removeItem("auth");
      localStorage.removeItem("id");
      navigate("/");
    }
  }, [auth]);

  const skeletonCount = 5;

  // In your return JSX, add:
  {
    !isOnline && (
      <div
        style={{
          backgroundColor: "#fef3c7",
          border: "1px solid #fde68a",
          color: "#92400e",
          padding: "8px 12px",
          borderRadius: "6px",
          margin: "10px 16px",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>📶 You're offline. Data will sync when you reconnect.</span>
        <span style={{ fontSize: "12px" }}>
          {queue.length > 0 && `${queue.length} pending sync`}
          {offlineImages.length > 0 &&
            ` • ${offlineImages.length} images saved offline`}
        </span>
      </div>
    );
  }
  console.log(isOnline, "isOnline");

  return (
    <div
      className="mobile-wrapper fixed-layout"
      style={{ background: "var(--purple-bg)", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div
        className="top-header fixed-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--purple-main)",
          color: "var(--text-light)",
          borderRadius: 12,
          padding: "12px 18px",
          marginBottom: 12,
        }}
      >
        <span
          className="store-title"
          style={{ fontWeight: 700, fontSize: 18, color: "var(--text-light)" }}
        >
          {localStorage.getItem("StoreName") || tasks?.[0]?.Store || ""}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              background: isOnline ? "var(--purple-accent)" : "#a7a7a7",
              color: "var(--purple-main)",
              padding: "10px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: isOnline ? "pointer" : "not-allowed",
              opacity: isOnline ? 1 : 0.6,
              transition: "background 0.2s",
            }}
            onClick={() => {
              if (isOnline) dispatch(fetchTasks(id));
            }}
            disabled={!isOnline}
          >
            Reload
          </button>
          <button
            style={{
              background: "#a279e9",
              color: "var(--text-light)",
              padding: "10px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="scrollable-tasks">
        <h3 className="page-title">Display list</h3>
        {loading ? (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={index} className="task-card">
              <Stack spacing={1}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={16} />
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="50%" height={16} />
              </Stack>
            </div>
          ))
        ) : displays.length === 0 ? (
          <div className="no-tasks">No displays found</div>
        ) : (
          <div
            style={{
              overflowY: "auto",
              maxHeight: "75vh",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            {displays.slice(0, visibleCount).map((display, index) => (
              <div
                style={{
                  marginBottom: "20px",
                  cursor: "pointer",
                  background: "var(--purple-main)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  // alignItems: "center",
                  gap: "16px",
                }}
                key={display.DisplayID}
                ref={index === displays.slice(0, visibleCount).length - 1 ? lastElementRef : null}
                onClick={() => {
                  navigate(`/task/${encodeURIComponent(display.DisplayID)}`);
                }}
              >
                {display.ImageURL ? (
                  <img
                    src={display.ImageURL}
                    alt={display.DisplayID}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      background: "#ffffff22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textAlign: "center",
                      padding: "6px",
                      border: "1px solid #ffffff33",
                    }}
                  >
                    {display.DisplayID}
                  </div>
                )}

                <div>
                  <div
                    className="task-title"
                    style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "white" }}
                  >
                    Display ID : {display.DisplayID}
                  </div>
                  <div style={{ fontSize: "14px", color: "white" }}>
                    Products: {display.products?.length || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="footer fixed-footer">
        <Version/>

      </div>

    </div>
  );
}
