import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../components/useNetworkStatus";
import { toast } from "react-toastify";
import { store, persistor } from "../redux/store";
import useDailyISTCleanup from "../hooks/useDailyISTCleanup";
import moment from "moment";

export default function TaskDetail() {
  const { displayId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  useDailyISTCleanup(store, persistor);

  // Find the display by DisplayID from all schedules
  const allDisplays = useSelector((state) =>
    state.tasks.tasks.flatMap((s) => s.displays || []),
  );
  const display = allDisplays.find(
    (d) => String(d.DisplayID) === String(displayId),
  );
  const products = display?.products || [];
  const imageData = display?.imageData || [];
  const auth = localStorage.getItem("auth");
  const [facing, setFacing] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  // Bulk facing
  const [bulkFacing, setBulkFacing] = useState("");
  // Camera modal
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  // Camera modal logic
  const startCamera = async () => {
    try {
      stopCamera();
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraError(null);
      setIsCameraReady(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setCameraError(
        "Camera access denied or not available. Please check permissions.",
      );
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
      stopCamera();
    } catch (error) {
      toast.error("Failed to capture image. Please try again.");
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

  useEffect(() => {
    if (auth !== "true") {
      localStorage.removeItem("auth");
      localStorage.removeItem("id");
      navigate("/");
    }
  }, [auth]);

  // Handle facing input change
  const handleFacingChange = (id, value) => {
    setFacing((prev) => ({ ...prev, [id]: value }));
  };

  // Submit facing values for all products
  const handleSubmit = async () => {
    setSubmitting(true);
    const userId = localStorage.getItem("UserID");
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    const payload = products.map((p) => ({
      ID: p.ID,
      Facing: Number(facing[p.ID]),
      DTOEntry: now,
      UserID: Number(userId),
    }));
    // Validate all Facing fields
    if (payload.some((p) => !p.Facing)) {
      toast.error("Please enter Facing for all products");
      setSubmitting(false);
      return;
    }
    try {
      if (isOnline) {
        await fetch(
          "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        toast.success("Submitted successfully");
      } else {
        dispatch({
          type: "ADD_TO_SYNC_QUEUE",
          payload: {
            type: "QUANTITY_SUBMIT",
            data: payload,
            retryCount: 0,
            maxRetries: 3,
          },
        });
        toast.info("Saved offline. Will sync when online.");
      }
    } catch (e) {
      toast.error("Submission failed");
    }
    setSubmitting(false);
  };

  // Apply to All Facing
  const handleApplyAll = () => {
    if (bulkFacing === "" || !/^\d+$/.test(bulkFacing)) {
      toast.error("Please enter facing value");
      return;
    }
    const updated = {};
    products.forEach((p) => {
      updated[p.ID] = bulkFacing;
    });
    setFacing(updated);
  };

  // Handle image submit for a given imageData entry
  const handleImageSubmit = async (imgId, imageFile) => {
    setImageSubmitting(true);
    const userId = localStorage.getItem("id") || "1";
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    const formData = new FormData();
    formData.append("ID", imgId);
    formData.append("DTOImage", now);
    formData.append("UserID", userId);
    formData.append("Image", imageFile);
    try {
      if (isOnline) {
        await fetch(
          "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkImageUpload",
          {
            method: "POST",
            body: formData,
          },
        );
        toast.success("Image submitted");
      } else {
        dispatch({
          type: "ADD_TO_SYNC_QUEUE",
          payload: {
            type: "IMAGE_UPLOAD",
            data: {
              ID: imgId,
              DTOImage: now,
              UserID: userId,
              Image: imageFile,
            },
            retryCount: 0,
            maxRetries: 3,
          },
        });
        toast.info("Image saved offline. Will sync when online.");
      }
    } catch (e) {
      toast.error("Image upload failed");
    }
    setImageSubmitting(false);
  };

  // UI
  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: "var(--purple-bg)",
        color: "var(--purple-dark)",
      }}
    >
      {/* Header */}
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
          {localStorage.getItem("StoreName") || display?.StoreID || ""}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              background: "var(--purple-accent)",
              color: "var(--purple-main)",
              padding: "10px 18px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={() => window.location.reload()}
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
            onClick={() => {
              localStorage.removeItem("auth");
              // localStorage.removeItem("id");
              localStorage.removeItem("StoreID");
              localStorage.removeItem("StoreName");
              localStorage.removeItem("Type");
              localStorage.removeItem("UserID");
              localStorage.removeItem("maindata");
              toast.error("Logout successful!");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>



      {/* Display Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          margin: "24px 0 16px 0",
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
              backgroundColor: "var(--purple-dark)",
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
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {display?.DisplayID}
          </div>
          <div style={{ fontSize: 14, color: "#888" }}>
            ScheduleID: {display?.ScheduleID} | Version: {display?.Version}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>Display Images</h3>
        <button
          onClick={() => {
            setShowCameraModal(true);
            setCapturedImage(null);
            setCameraError(null);
            setTimeout(startCamera, 100);
          }}
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
            marginBottom: 16,
          }}
        >
          Take Image
        </button>

        {/* Camera Modal */}
        {showCameraModal && (
          <div
            style={{
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
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                width: "100%",
                maxWidth: 500,
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
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
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
                      <div style={{ color: "#ef4444", marginBottom: 8 }}>
                        {cameraError}
                      </div>
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
                        <div
                          style={{
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
                          }}
                        >
                          Initializing camera...
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={captureImage}
                    disabled={!isCameraReady || cameraError}
                    style={{
                      backgroundColor:
                        !isCameraReady || cameraError
                          ? "#9ca3af"
                          : "var(--purple-main)",
                      color: "white",
                      padding: "14px 24px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor:
                        !isCameraReady || cameraError
                          ? "not-allowed"
                          : "pointer",
                      width: "100%",
                      opacity: !isCameraReady || cameraError ? 0.7 : 1,
                    }}
                  >
                    {cameraError ? "Camera Not Available" : "Capture Image"}
                  </button>
                </div>
              ) : (
                <div>
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
                      onClick={async () => {
                        if (!capturedImage) return;
                        const userId = localStorage.getItem("id") || "1";
                        const now = moment().format("YYYY-MM-DD HH:mm:ss");
                        const slotId = imageData[0]?.ID;
                        if (!slotId) {
                          toast.error("No image slot available");
                          return;
                        }
                        // Convert base64 to Blob
                        const arr = capturedImage.split(",");
                        const mime = arr[0].match(/:(.*?);/)[1];
                        const bstr = atob(arr[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) u8arr[n] = bstr.charCodeAt(n);
                        const imageFile = new File(
                          [u8arr],
                          `image_${Date.now()}.jpg`,
                          { type: mime },
                        );
                        const formData = new FormData();
                        formData.append("ID", slotId);
                        formData.append("DTOImage", now);
                        formData.append("UserID", userId);
                        formData.append("Image", imageFile);
                        try {
                          await fetch(
                            "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkImageUpload",
                            { method: "POST", body: formData },
                          );
                          toast.success("Image submitted");
                          setShowCameraModal(false);
                          setCapturedImage(null);
                          stopCamera();
                        } catch (e) {
                          toast.error("Image upload failed");
                        }
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "var(--purple-main)",
                        color: "white",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: "pointer",
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product List with Apply to All */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>Product List</h3>
        {products.length === 0 ? (
          <div style={{ color: "#888", fontSize: 15 }}>
            No products found for this display.
          </div>
        ) : (
          <div>



            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <label style={{ fontSize: 14, fontWeight: 500 }}>Facing:</label>
              <input
                type="text"
                value={bulkFacing}
                onChange={(e) => setBulkFacing(e.target.value)}
                style={{
                  width: 80,
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: 16,
                  textAlign: "center",
                  backgroundColor: "#f9fafb",
                  margin: "0px",
                }}
                placeholder="-"
              />
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
                  cursor: products.length === 0 ? "not-allowed" : "pointer",
                  minWidth: 120,
                  opacity: products.length === 0 ? 0.7 : 1,
                }}
                disabled={products.length === 0}
              >
                Apply to All
              </button>
            </div>



            {products.map((p) => (
              <div
                key={p.ID}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    ArticleNo: {p.ArticleNo}
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    UpcCode: {p.UpcCode}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Facing"
                  value={facing[p.ID] || ""}
                  onChange={(e) => handleFacingChange(p.ID, e.target.value)}
                  style={{
                    width: 80,
                    padding: "8px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: 15,
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? "#9ca3af" : "var(--purple-main)",
                color: "white",
                padding: "14px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: submitting ? "not-allowed" : "pointer",
                width: "100%",
                opacity: submitting ? 0.7 : 1,
                marginTop: 10,
              }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}
      </div>

      {/* Image Upload Section and Camera Modal */}

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "var(--purple-bg)",
    minHeight: "100vh",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "var(--purple-dark)",
  },
};
