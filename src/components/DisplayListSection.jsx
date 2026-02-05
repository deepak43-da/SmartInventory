import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNetworkStatus } from "./useNetworkStatus";
import { syncQueue } from "../redux/actions/offlineActions";
import { captureImageWithOfflineSupport } from "../redux/actions/offlineActions";

const DisplayListSection = ({
  displayList = [],
  loadingDisplayList,
  StoreID,
  SupplierID,
  ScheduleID,
  DOWork,
  ActivityID,
}) => {
  const dispatch = useDispatch();
  const { isOnline } = useNetworkStatus();
  const [quantityValues, setQuantityValues] = useState({});
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { queue, networkStatus } = useSelector((state) => state.tasks);

  // Initialize quantity values
  useEffect(() => {
    const initialValues = {};
    displayList.forEach(item => {
      initialValues[item.DisplayID] = item.Quantity || "";
    });
    setQuantityValues(initialValues);
    setBulkQuantity("");
  }, [displayList]);

  // Start camera when modal opens
  useEffect(() => {
    if (showCameraModal && !capturedImage) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [showCameraModal, capturedImage]);

  const startCamera = async () => {
    try {
      stopCamera(); // Stop any existing stream
      
      const constraints = {
        video: {
          facingMode: { exact: "environment" }, // Try back camera first
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to any camera
        console.log("Back camera not available, using any camera");
        constraints.video.facingMode = { ideal: "environment" };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      streamRef.current = stream;
      setCameraError(null);
      setIsCameraReady(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError("Camera access denied or not available. Please check permissions.");
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !isCameraReady) {
      toast.error("Camera is not ready. Please try again.");
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      
      // Stop camera after capture
      stopCamera();
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Failed to capture image. Please try again.");
    }
  };

  const handleQuantityChange = (displayId, value) => {
    // Allow only numbers
    if (value === "" || /^\d+$/.test(value)) {
      setQuantityValues(prev => ({
        ...prev,
        [displayId]: value
      }));
    }
  };

  const handleApplyAll = () => {
    if (bulkQuantity === "" || !/^\d+$/.test(bulkQuantity)) {
      toast.error("Please enter facing value");
      return;
    }


    setQuantityValues(prev => {
      const updated = { ...prev };
      displayList.forEach(item => {
        updated[item.DisplayID] = bulkQuantity;
      });
      return updated;
    });
  };

const validateForm = () => {
  let hasError = false;

  displayList.forEach(item => {
    const value = quantityValues[item.DisplayID];
    if (!value || value.trim() === "") {
      hasError = true;
    }
  });

  if (hasError) {
    toast.error("Please enter quantity for all displays");
    return false;
  }

  return true;
};


const handleSubmit = async () => {
  const isValid = validateForm();

  if (!isValid) return; // 🔥 STOP here if validation fails

  setSubmitLoading(true);

  try {
    const submissionData = displayList.map(item => ({
      DisplayID: item.DisplayID,
      Quantity: quantityValues[item.DisplayID],
      ScheduleID,
      StoreID,
      SupplierID,
      ActivityID,
      DOWork,
      UserID: StoreID,
      Timestamp: new Date().toISOString(),
    }));

    if (isOnline) {
      await submitDisplayQuantities(submissionData);
      toast.success("Quantities submitted successfully!");
    } else {
      await dispatch({
        type: "ADD_TO_SYNC_QUEUE",
        payload: {
          type: "QUANTITY_SUBMIT",
          data: submissionData,
          retryCount: 0,
          maxRetries: 3,
        },
      });
      toast.info("Data saved offline. Will sync when online.");
    }
  } catch (error) {
    toast.error("Failed to submit: " + error.message);
  } finally {
    setSubmitLoading(false);
  }
};


  const submitDisplayQuantities = async (data) => {
    // Replace with your actual API endpoint
    const response = await fetch('https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/SubmitDisplayQuantities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    
    if (!response.ok) {
      throw new Error('Submission failed');
    }
    
    return response.json();
  };

  const handleManualSync = async () => {
    if (networkStatus === "online") {
      setLoading(true);
      try {
        await dispatch(syncQueue());
        toast.success("Sync completed");
      } catch (error) {
        toast.error("Sync failed: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning("You are offline. Please connect to the internet to sync.");
    }
  };

  const handleCaptureImage = async () => {
    setCameraLoading(true);
    try {
      const metadata = {
        userId: StoreID,
        taskId: ScheduleID,
        scheduleId: ScheduleID,
        storeId: StoreID,
        supplierId: SupplierID,
        DOWork: DOWork,
        type: "display_image",
        timestamp: new Date().toISOString(),
      };

      const result = await dispatch(
        captureImageWithOfflineSupport(capturedImage, metadata)
      );

      if (result.success) {
        toast.success("Image captured successfully!");
        setShowCameraModal(false);
        setCapturedImage(null);
      } else {
        toast.error(result.message || "Failed to save image");
      }
    } catch (error) {
      toast.error("Error capturing image: " + error.message);
    } finally {
      setCameraLoading(false);
    }
  };
  

  
  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

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

        {submitLoading === false && quantityValues[displayList[0]?.DisplayID] && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowCameraModal(true)}
            style={{
              backgroundColor: "var(--purple-main)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              width: "100%",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
            }}
          >
            Take Image
          </button>
        </div>
      )}
      </div>

<div style={{display:"flex", justifyContent:"space-between", gap:12}}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          // justifyContent
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Facing:</label>
          <input
            type="text"
            value={bulkQuantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setBulkQuantity(value);
              }
            }}
            style={{
              width: 80,
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: 16,
              textAlign: "center",
              backgroundColor: "#f9fafb",
              margin:"0px",
            }}
            placeholder="-"
          />
        </div>
        <button
          onClick={handleApplyAll}
          style={{
            backgroundColor: "var(--purple-main)",
            color: "white",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            cursor: displayList.length === 0 ? "not-allowed" : "pointer",
            minWidth: 120,
            opacity: displayList.length === 0 ? 0.7 : 1,
          }}
          disabled={displayList.length === 0}
        >
          Apply to All
        </button>
      </div>

      

      <div>
        {/* Sync button */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {networkStatus === "offline" && (
            <span style={{
              color: "#dc2626",
              fontSize: 12,
              padding: "4px 8px",
              background: "#fef2f2",
              borderRadius: 4,
            }}>
              Offline Mode
            </span>
          )}

          {queue.length > 0 && (
            <button
              style={{
                backgroundColor: networkStatus === "online" ? "var(--purple-main)" : "#9ca3af",
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
              {loading ? "Syncing..." : "Sync Offline Data"}
            </button>
          )}
        </div>
      </div>
</div>
      {/* Camera Take Display Button - Only show after successful submission */}
     

      {/* Display list with quantity fields */}
      {displayList.length === 0 && !loadingDisplayList && (
        <div style={{
          textAlign: "center",
          color: "#888",
          margin: "32px 0",
          fontWeight: 500,
          fontSize: 18,
          padding: 40,
          backgroundColor: "#f9fafb",
          borderRadius: 12,
        }}>
          No work items available
        </div>
      )}

      

      {displayList.length > 0 && (
        <div>
          {displayList.map((item) => (
            <div
              key={item.DisplayID}
              style={{
                border: "1px solid #e5e7eb",
                padding: 16,
                borderRadius: 12,
                background: "#fff",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                columnGap: 15,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  Display {item.DisplayID}
                </div>
                {item.Description && (
                  <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                    {item.Description}
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Facing:</label>
                <input
                  type="text"
                  value={quantityValues[item.DisplayID] || ""}
                  onChange={(e) => handleQuantityChange(item.DisplayID, e.target.value)}
                  style={{
                    width: 80,
                    padding: "8px 12px",
                    border: `1px solid ${
                      !quantityValues[item.DisplayID] && submitLoading ? "#ef4444" : "#e5e7eb"
                    }`,
                    borderRadius: "6px",
                    fontSize: 16,
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                  }}
                  placeholder="-"
                />
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleSubmit}
              disabled={submitLoading}
              style={{
                backgroundColor: submitLoading ? "#9ca3af" : "var(--purple-main)",
                color: "white",
                padding: "14px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: submitLoading ? "not-allowed" : "pointer",
                width: "100%",
                opacity: submitLoading ? 0.7 : 1,
              }}
            >
              {submitLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 500,
            maxHeight: "90vh",
            overflow: "auto",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                Take Display Image
              </h3>
              <button
                onClick={() => {
                  setShowCameraModal(false);
                  setCapturedImage(null);
                  stopCamera();
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: 0,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                }}
              >
                ✕
              </button>
            </div>

            {/* Camera Component */}
            {!capturedImage ? (
              <div>
                {cameraError ? (
                  <div style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
                    <div style={{ color: "#ef4444", marginBottom: 8 }}>{cameraError}</div>
                    <button
                      onClick={startCamera}
                      style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        marginTop: 8,
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        backgroundColor: "#000",
                        marginBottom: 16,
                        aspectRatio: "4/3",
                        objectFit: "cover",
                      }}
                    />
                    {!isCameraReady && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 16,
                      }}>
                        Initializing camera...
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={captureImage}
                  disabled={!isCameraReady || cameraError}
                  style={{
                    backgroundColor: !isCameraReady || cameraError ? "#9ca3af" : "var(--purple-main) ",
                    color: "white",
                    padding: "14px 24px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: (!isCameraReady || cameraError) ? "not-allowed" : "pointer",
                    width: "100%",
                    opacity: (!isCameraReady || cameraError) ? 0.7 : 1,
                  }}
                >
                  {cameraError ? "Camera Not Available" : "Capture Image"}
                </button>
              </div>
            ) : (
              <div>
                {/* <div style={{
                  textAlign: "center",
                  marginBottom: 16,
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#374151",
                }}>
                  Image Preview
                </div> */}
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    marginBottom: 16,
                    aspectRatio: "4/3",
                    objectFit: "contain",
                    backgroundColor: "#f3f4f6",
                  }}
                />
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={retakeImage}
                    style={{
                      flex: 1,
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleCaptureImage}
                    disabled={cameraLoading}
                    style={{
                      flex: 1,
                      backgroundColor: cameraLoading ? "#9ca3af" : "var(--purple-main)",
                      color: "white",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: cameraLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {cameraLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{
                          width: 16,
                          height: 16,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 1s linear infinite",
                        }}></span>
                        Saving...
                      </span>
                    ) : "Submit Image"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default DisplayListSection;