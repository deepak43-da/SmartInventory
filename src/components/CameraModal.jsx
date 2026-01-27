import React, { useRef, useState } from "react";

import { MdClose } from "react-icons/md";

export default function CameraModal({
  onCapture,
  onConfirm,
  onRetake,
  capturedImage,
  heading,
  onClose,
  confirmLoading = false,
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  React.useEffect(() => {
    if (!capturedImage) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    // Use camera's natural resolution for high quality
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, width, height);
    const image = canvas.toDataURL("image/png");
    onCapture(image);
  };

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
      {/* Only keep the improved modal content below, remove duplicate/old modal content above */}
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          // width: 320,
          maxWidth: 280,
          width: "90vw",
          position: "relative",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Heading and Close Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            width: "100%",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 20, color: "#222" }}>
            {heading || "Camera"}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                marginLeft: 8,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              aria-label="Close"
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "none")}
            >
              <MdClose size={24} color="#222" />
            </button>
          )}
        </div>
        {/* Improved modal content only (single version) */}

        {!capturedImage ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              style={{
                width: "100%",

                height: 220,
                borderRadius: 10,
                background: "#f3f4f6",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                objectFit: "contain",
              }}
            />

            <button
              onClick={handleCapture}
              style={{
                marginTop: 22,
                padding: "10px 32px",
                borderRadius: 20,
                background: "#10b981",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#059669")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#10b981")}
            >
              Capture
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={capturedImage}
              alt="Captured"
              style={{
                width: 164,
                height: 220,
                borderRadius: 10,
                background: "#f3f4f6",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 18,
                marginTop: 22,
                justifyContent: "center",
              }}
            >
              <button
                onClick={onRetake}
                style={{
                  padding: "10px 32px",
                  borderRadius: 20,
                  background: "#eee",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#222",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#e5e7eb")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "#eee")}
              >
                Retake
              </button>
              <button
                onClick={onConfirm}
                style={{
                  padding: "10px 32px",
                  borderRadius: 20,
                  background: confirmLoading ? "#059669" : "#10b981",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
                  cursor: confirmLoading ? "not-allowed" : "pointer",
                  opacity: confirmLoading ? 0.7 : 1,
                  transition: "background 0.2s",
                  position: "relative",
                }}
                disabled={confirmLoading}
                onMouseOver={(e) => {
                  if (!confirmLoading)
                    e.currentTarget.style.background = "#059669";
                }}
                onMouseOut={(e) => {
                  if (!confirmLoading)
                    e.currentTarget.style.background = "#10b981";
                }}
              >
                {confirmLoading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: "2.5px solid #fff",
                        borderTop: "2.5px solid #10b981",
                        borderRadius: "50%",
                        display: "inline-block",
                        marginRight: 8,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Loading...
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
