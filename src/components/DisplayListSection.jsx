
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CameraInline from "./CameraInline";
import {
  captureImageWithOfflineSupport,
  syncQueue,
} from "../redux/actions/offlineActions";
import { toast } from "react-toastify";
import { useNetworkStatus } from "./useNetworkStatus";

const DisplayListSection = ({
  displayList = [],
  loadingDisplayList,
  StoreID,
  SupplierID,
  ScheduleID,
  DOWork,
}) => {
  const dispatch = useDispatch();
   const { isOnline } = useNetworkStatus();
  const [cameraStep, setCameraStep] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // Get offline state from Redux
  const { offlineImages, queue, networkStatus } = useSelector(
    (state) => state.tasks,
  );

  // Handle image load error
  const handleImageError = (displayId) => {
    setFailedImages((prev) => ({
      ...prev,
      [displayId]: true,
    }));
  };

  // Get image URL or dummy image
  const getImageUrl = (item) => {
    if (failedImages[item.DisplayID]) {
      return getDummyImageUrl(item);
    }
    return item.ImageURL || getDummyImageUrl(item);
  };

  // Generate a dummy image URL based on display data
  const getDummyImageUrl = (item) => {
    // You can use a placeholder service or create a colored div
    const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
    const colorIndex = item.DisplayID?.toString().charCodeAt(0) % colors.length || 0;
    
    // Create a data URL for a colored rectangle with text
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 200, 200);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Display ID or first 3 chars
    const displayText = item.DisplayID 
      ? `Display ${item.DisplayID.toString().substring(0, 8)}`
      : 'Display';
    
    ctx.fillText(displayText, 100, 100);
    
    // Status
    ctx.font = '12px Arial';
    // const statusText = item.Completed === "Yes" ? "Completed" : "Pending";
    // ctx.fillText(statusText, 100, 120);
    
    return canvas.toDataURL();
  };

  // Helper to check if display has both images
  const hasBothImages = (displayId) => {
    // Check online data
    const display = displayList.find((d) => d.DisplayID === displayId);
    const hasOnlineBefore = display && display.BeforeImageURL;
    const hasOnlineAfter = display && display.AfterImageURL;

    // Check offline images
    const offlineBefore = offlineImages.find(
      (img) =>
        img.metadata?.displayId === displayId &&
        img.metadata?.stage?.toLowerCase() === "before",
    );
    const offlineAfter = offlineImages.find(
      (img) =>
        img.metadata?.displayId === displayId &&
        img.metadata?.stage?.toLowerCase() === "after",
    );

    // Check pending uploads in queue
    const queueBefore = queue.some(
      (item) =>
        item.type === "IMAGE_UPLOAD" &&
        item.data?.metadata?.displayId === displayId &&
        item.data?.metadata?.stage?.toLowerCase() === "before",
    );
    const queueAfter = queue.some(
      (item) =>
        item.type === "IMAGE_UPLOAD" &&
        item.data?.metadata?.displayId === displayId &&
        item.data?.metadata?.stage?.toLowerCase() === "after",
    );

    return (
      (hasOnlineBefore || offlineBefore || queueBefore) &&
      (hasOnlineAfter || offlineAfter || queueAfter)
    );
  };

  // Helper to get current image state for a display
  const getDisplayImageState = (displayId) => {
    const display = displayList.find((d) => d.DisplayID === displayId);

    const hasBefore =
      (display && display.BeforeImageURL) ||
      offlineImages.some(
        (img) =>
          img.metadata?.displayId === displayId &&
          img.metadata?.stage?.toLowerCase() === "before",
      ) ||
      queue.some(
        (item) =>
          item.type === "IMAGE_UPLOAD" &&
          item.data?.metadata?.displayId === displayId &&
          item.data?.metadata?.stage?.toLowerCase() === "before",
      );

    const hasAfter =
      (display && display.AfterImageURL) ||
      offlineImages.some(
        (img) =>
          img.metadata?.displayId === displayId &&
          img.metadata?.stage?.toLowerCase() === "after",
      ) ||
      queue.some(
        (item) =>
          item.type === "IMAGE_UPLOAD" &&
          item.data?.metadata?.displayId === displayId &&
          item.data?.metadata?.stage?.toLowerCase() === "after",
      );

    return { hasBefore, hasAfter, completed: hasBefore && hasAfter };
  };

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
  };

  const handleConfirmCapture = async () => {
    if (!capturedImage || !cameraStep) return;

    setLoading(true);
    try {
      const metadata = {
        userId: StoreID,
        taskId: ScheduleID,
        displayId: cameraStep.displayId,
        scheduleId: ScheduleID,
        storeId: StoreID,
        supplierId: SupplierID,
        DOWork: DOWork,
        stage: cameraStep.stage,
        type: "display_image",
        timestamp: new Date().toISOString(),
      };

      const result = await dispatch(
        captureImageWithOfflineSupport(capturedImage, metadata),
      );

      if (result.success) {
        // Determine next step
        const imageState = getDisplayImageState(cameraStep.displayId);

        if (cameraStep.stage === "before" && !imageState.hasAfter) {
          // Move to after image
          setCameraStep({
            displayId: cameraStep.displayId,
            stage: "after",
          });
        } else {
          // Done with this display
          setCameraStep(null);
        }
        setCapturedImage(null);
      } else {
        alert(result.message || "Failed to save image");
      }
    } catch (error) {
      console.error("Capture error:", error);
      alert("An error occurred while saving the image");
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleDisplayClick = (displayId) => {
    if (hasBothImages(displayId)) {
      return; // Disabled
    }

    const imageState = getDisplayImageState(displayId);

    if (!imageState.hasBefore) {
      // Start with before image
      setCameraStep({ displayId, stage: "before" });
    } else if (!imageState.hasAfter) {
      // Move to after image
      setCameraStep({ displayId, stage: "after" });
    }
  };

  const handleManualSync = async () => {
    if (networkStatus === "online") {
      setLoading(true);
      try {
        await dispatch(syncQueue());
         toast.success("Sync completed");
      } catch (error) {
        alert("Sync failed: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert("You are offline. Please connect to the internet to sync.");
    }
  };

  console.log(isOnline ,offlineImages.length , queue.length , "deepak")

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>
          Product List {networkStatus === "offline" && "(Offline)"}
        </h2>

        {/* Sync button */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {networkStatus === "offline" && (
            <span
              style={{
                color: "#dc2626",
                fontSize: 12,
                padding: "4px 8px",
                background: "#fef2f2",
                borderRadius: 4,
              }}
            >
              Offline Mode
            </span>
          )}

          {/* {(offlineImages.length > 0 || queue.length > 0) && ( */}
          {(queue.length > 0) && (
            <button
              style={{
                backgroundColor:
                  networkStatus === "online" ? "#10b981" : "#9ca3af",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 600,
                border: "none",
                cursor: networkStatus === "online" ? "pointer" : "not-allowed",
                fontSize: 14,
              }}
              onClick={handleManualSync}
              disabled={loading || networkStatus === "offline"}
            >
              {loading
                ? "Syncing..."
                // : `Sync (${offlineImages.length })`}
                : `Sync Offline Images`}
            </button>
          )}
        </div>
      </div>


  <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
       

          {(queue.length > 0  && isOnline === false) && (
           <div style={{
            padding: "10px",
    background: "rgb(238 221 192)",
    width: "100%",
    textAlign: "center",
    color: "red",
    borderRadius: "11px",
           }}>
Please make sure to sync offline images by today, otherwise they’ll be lost.

           </div>
          )}
        </div>
    


      {/* Camera section */}
      {cameraStep && (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            background: "#f8fafc",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <CameraInline
            capturedImage={capturedImage}
            onCapture={handleCapture}
            onRetake={handleRetake}
            onConfirm={handleConfirmCapture}
            stage={cameraStep.stage}
            confirmLoading={loading}
          />
        </div>
      )}

      {/* Pending uploads */}
      {/* {(offlineImages.length > 0 || queue.length > 0) && !cameraStep && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: "#fefce8",
            borderRadius: 12,
            border: "1px solid #fde047",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "#854d0e",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>📤</span>
            <span>
              Pending Uploads ({offlineImages.length} offline,{" "}
              {queue.filter((q) => q.status === "pending").length} pending)
            </span>
          </div>
        </div>
      )} */}

      {/* Display list */}
      {!cameraStep && displayList.length === 0 && !loadingDisplayList && (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            margin: "32px 0",
            fontWeight: 500,
            fontSize: 18,
            padding: 40,
            backgroundColor: "#f9fafb",
            borderRadius: 12,
          }}
        >
          No work items available
        </div>
      )}

      {!cameraStep && displayList.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {displayList.map((item) => {
            const imageState = getDisplayImageState(item.DisplayID);
            const disabled = imageState.completed;
            const imageUrl = getImageUrl(item);

            return (
              <div
                key={item.DisplayID}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 16,
                  borderRadius: 12,
                  background: "#fff",
                  opacity: disabled ? 0.7 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                  position: "relative",
                  transition: "all 0.2s",
                  ...(!disabled && {
                    "&:hover": {
                      borderColor: "#10b981",
                      boxShadow: "0 2px 8px rgba(16,185,129,0.1)",
                    },
                  }),
                }}
                onClick={() => handleDisplayClick(item.DisplayID)}
              >
                <div
                  style={{
                    width: "100%",
                    height: 150,
                    borderRadius: 8,
                    marginBottom: 12,
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Display ${item.DisplayID}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={() => handleImageError(item.DisplayID)}
                  />
                  
                  {/* {failedImages[item.DisplayID] && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        color: "white",
                        borderSizing: "border-box",
                      }}
                    >
                      
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        Display {item.DisplayID}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          opacity: 0.9,
                          textAlign: "center",
                        }}
                      >
                        {item.Completed === "Yes" ? "Completed" : "Pending"}
                      </div>
                    </div>
                  )} */}
                </div>

                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                >
                  ID: {item.DisplayID}
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      background: imageState.hasBefore ? "#10b981" : "#f3f4f6",
                      color: imageState.hasBefore ? "white" : "#6b7280",
                    }}
                  >
                    Before {imageState.hasBefore ? "✓" : "✗"}
                  </div>
                  <div
                    style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      background: imageState.hasAfter ? "#10b981" : "#f3f4f6",
                      color: imageState.hasAfter ? "white" : "#6b7280",
                    }}
                  >
                    After {imageState.hasAfter ? "✓" : "✗"}
                  </div>
                </div>

                {/* Status indicator */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* <div
                    style={{
                      fontSize: 11,
                      color: item.Completed === "Yes" ? "#059669" : "#d97706",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 4,
                      backgroundColor: item.Completed === "Yes" ? "#d1fae5" : "#fef3c7",
                    }}
                  >
                    {item.Completed === "Yes" ? "Completed" : "Pending"}
                  </div> */}
                  
                  {/* {failedImages[item.DisplayID] && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#6b7280",
                        padding: "2px 6px",
                        background: "#f3f4f6",
                        borderRadius: 4,
                      }}
                      title="Using placeholder image"
                    >
                      ⚠️ Placeholder
                    </div>
                  )} */}
                </div>

                {disabled && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#10b981",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DisplayListSection;