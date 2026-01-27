import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../redux/actions/tasksActions";
import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import "./taskList.css";
import { toast } from "react-toastify";
import { useNetworkStatus } from "../components/useNetworkStatus";
 import moment from "moment-timezone";
import { store, persistor } from "../redux/store";
import useDailyISTCleanup from "../hooks/useDailyISTCleanup";

export default function TaskList() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useDailyISTCleanup(store, persistor);

  // Add this to your TaskList component
  const { isOnline } = useNetworkStatus();
  const { queue = [], offlineImages = [] } = useSelector(
    (state) => state.tasks || {},
  );

  const tasks = useSelector((state) => state.tasks.tasks);
  const loading = false; // Optionally wire to a loading state in redux

  // ... (previous imports and code remain the same until handleLogout) ...

  const handleLogout = () => {
    // Only clear session data, NOT the captured images
    localStorage.removeItem("auth");
    localStorage.removeItem("id");
    // Note: We keep 'maindata' to avoid unnecessary API calls
    // localStorage.removeItem('maindata');
    toast.error("Logout successful!");
    // Navigate to login
    navigate("/");
  };

  // const isTaskActive = (task) => {
  //   const now = new Date();

  //   // ---- DATE RANGE CHECK ----
  //   const startDate = new Date(task.StartDate);
  //   const endDate = new Date(task.EndDate);
  //   endDate.setHours(23, 59, 59, 999);

  //   if (now < startDate || now > endDate) return false;

  //   // ---- TIME SLOT CHECK ----
  //   const currentHour = now.getHours();

  //   if (task.TimeSlot === "Evening") {
  //     // Evening: 3pm (15:00) to 6pm (18:00)
  //     return currentHour >= 15 && currentHour < 18;
  //   }

  //   if (task.TimeSlot === "Night") {
  //     // Night: 6pm (18:00) to midnight (0:00)
  //     return currentHour >= 18 && currentHour <= 23;
  //   }

  //   // If TimeSlot doesn't match Evening or Night, return false
  //   return false;
  // };

  const TZ = "Asia/Riyadh";
    const isTaskActive = (task) => {
    const now = moment().tz(TZ);

    const start = moment.tz(task.StartDate, TZ);
    const end = moment.tz(task.EndDate, TZ).endOf("day");

    if (!now.isBetween(start, end, null, "[]")) return false;

    const hour = now.hour();

    if (task.TimeSlot === "Evening") {
      return hour >= 15 && hour < 18;
    }

    if (task.TimeSlot === "Night") {
      return hour >= 18 && hour <= 23;
    }

    return false;
  };

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
  console.log(isOnline,"isOnline")

  return (
    <div className="mobile-wrapper fixed-layout">
      {/* HEADER */}
      <div
        className="top-header fixed-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="store-title">
          {localStorage.getItem("StoreName") || tasks?.[0]?.Store || ""}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              backgroundColor: isOnline ? "#10b981" : "#a7a7a7",
              color: "white",
              padding: "10px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              cursor: isOnline ? "pointer" : "not-allowed",
              opacity: isOnline ? 1 : 0.6,
            }}
            onClick={() =>{ 
              if(isOnline)    dispatch(fetchTasks(id))
              
           }}
            disabled={!isOnline}
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
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="scrollable-tasks">
        <h3 className="page-title">Today's Tasks</h3>
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
        ) : tasks.length === 0 ? (
          <div className="no-tasks">No tasks found</div>
        ) : (
          <div
            style={{
              overflowY: "auto",
              maxHeight: "66vh",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            {tasks.map((t) => {
              const active = isTaskActive(t);
              return (
                <div
                  style={{
                    marginBottom: "20px",
                    cursor: active ? "pointer" : "not-allowed",
                  }}
                  key={t.ActivityID}
                  onClick={() => {
                    if (true) {
                      const url = `/task/${encodeURIComponent(
                        t?.Store,
                      )}/${encodeURIComponent(
                        t.ActivityID,
                      )}/${encodeURIComponent(t.StoreID)}/${encodeURIComponent(
                        t.SupplierID,
                      )}/${encodeURIComponent(t.ScheduleID)}/${encodeURIComponent(
                        t.Supplier,
                      )}/${encodeURIComponent(t.Activity)}/${encodeURIComponent(
                        t.Duration,
                      )}/${encodeURIComponent(t.DOWork)}`;
                      navigate(url);
                    }
                  }}
                  // className={`task-card ${active ? "active" : "inactive"}`}
                >
                  <div className="task-row">
                    <span className="task-title">
                      {t.Supplier} - {t.Activity}
                    </span>
                    <span
                      className={`status-pill ${
                        active ? "active" : "inactive"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="task-id">Hrs Book: {t.Duration} hrs</div>

                  <div className="task-id">
                    {(() => {
                      // Count displays completed either by backend or by offline images
                      const displayCount = t.displays?.length || 0;
                      let completedCount = 0;
                      if (Array.isArray(t.displays)) {
                        completedCount = t.displays.filter((d) => {
                          if (d.Completed === "Yes") return true;
                          // Check for offline images for both before and after
                          const beforeImg = offlineImages.find(
                            (img) =>
                              img.metadata?.displayId === d.DisplayID &&
                              img.metadata?.stage?.toLowerCase() === "before",
                          );
                          const afterImg = offlineImages.find(
                            (img) =>
                              img.metadata?.displayId === d.DisplayID &&
                              img.metadata?.stage?.toLowerCase() === "after",
                          );
                          return beforeImg && afterImg;
                        }).length;
                      }
                      return `Display Completed: ${completedCount}/${displayCount}`;
                    })()}
                  </div>

                  <div className="task-info">
                    <div className="info-row">🕒 {t.TimeSlot}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="footer fixed-footer">
        <div>Evening (3pm till Before 6pm)</div>
        <div>Night (6pm till Before Midnight)</div>
      </div>
    </div>
  );
}
