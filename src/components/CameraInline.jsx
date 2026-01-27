// import React, { useRef, useEffect, useState } from "react";

// export default function CameraInline({
//   capturedImage,
//   onCapture,
//   onRetake,
//   onConfirm,
//   stage,
//   confirmLoading = false,
// }) {
//   const videoRef = useRef(null);
//   const [stream, setStream] = useState(null);

//   useEffect(() => {
//     if (!capturedImage) {
//       navigator.mediaDevices
//         .getUserMedia({ video: true })
//         .then((mediaStream) => {
//           setStream(mediaStream);
//           if (videoRef.current) {
//             videoRef.current.srcObject = mediaStream;
//           }
//         });
//     }
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [capturedImage]);

//   const handleCapture = () => {
//     const canvas = document.createElement("canvas");
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;
//     canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
//     const image = canvas.toDataURL("image/png");
//     onCapture(image);
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "#fff",
//         borderRadius: 16,
//         boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
//         padding: 32,
//         width: 320,
//         maxWidth: 400,
//         width: "100%",
//       }}
//     >
//       <div
//         style={{
//           fontWeight: 700,
//           fontSize: 18,
//           marginBottom: 18,
//           color: "#222",
//         }}
//       >
//         {stage === "before" ? "Before Image" : "After Image"}
//       </div>
//       {!capturedImage ? (
//         <>
//           <video
//             ref={videoRef}
//             autoPlay
//             style={{
//               width: 240,
//               height: 180,
//               borderRadius: 12,
//               marginBottom: 18,
//               background: "#f3f4f6",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//             }}
//           />
//           <button
//             style={{
//               background: "#10b981",
//               color: "#fff",
//               padding: "10px 32px",
//               borderRadius: 20,
//               border: "none",
//               fontWeight: 600,
//               fontSize: 16,
//               marginBottom: 8,
//               cursor: "pointer",
//               boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
//               transition: "background 0.2s",
//             }}
//             onClick={handleCapture}
//             onMouseOver={(e) => (e.currentTarget.style.background = "#059669")}
//             onMouseOut={(e) => (e.currentTarget.style.background = "#10b981")}
//           >
//             {stage === "before" ? "Before Image" : "After Image"}
//           </button>
//         </>
//       ) : (
//         <>
//           <img
//             src={capturedImage}
//             alt="Captured"
//             style={{
//               width: 140,
//               height: 180,
//               borderRadius: 12,
//               marginBottom: 18,
//               background: "#f3f4f6",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//             }}
//           />
//           <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
//             <button
//               style={{
//                 background: "#eee",
//                 color: "#374151",
//                 padding: "10px 32px",
//                 borderRadius: 20,
//                 border: "none",
//                 fontWeight: 600,
//                 fontSize: 16,
//                 cursor: "pointer",
//                 transition: "background 0.2s",
//               }}
//               onClick={onRetake}
//               onMouseOver={(e) =>
//                 (e.currentTarget.style.background = "#e5e7eb")
//               }
//               onMouseOut={(e) => (e.currentTarget.style.background = "#eee")}
//             >
//               Retake
//             </button>
//             <button
//               style={{
//                 background: confirmLoading ? "#059669" : "#10b981",
//                 color: "#fff",
//                 padding: "10px 32px",
//                 borderRadius: 20,
//                 border: "none",
//                 fontWeight: 600,
//                 fontSize: 16,
//                 cursor: confirmLoading ? "not-allowed" : "pointer",
//                 boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
//                 transition: "background 0.2s",
//                 opacity: confirmLoading ? 0.7 : 1,
//                 position: "relative",
//               }}
//               onClick={onConfirm}
//               disabled={confirmLoading}
//               onMouseOver={(e) => {
//                 if (!confirmLoading)
//                   e.currentTarget.style.background = "#059669";
//               }}
//               onMouseOut={(e) => {
//                 if (!confirmLoading)
//                   e.currentTarget.style.background = "#10b981";
//               }}
//             >
//               {confirmLoading ? (
//                 <span
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <span
//                     style={{
//                       width: 18,
//                       height: 18,
//                       border: "2.5px solid #fff",
//                       borderTop: "2.5px solid #10b981",
//                       borderRadius: "50%",
//                       display: "inline-block",
//                       marginRight: 8,
//                       animation: "spin 1s linear infinite",
//                     }}
//                   />
//                   Loading...
//                   <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
//                 </span>
//               ) : (
//                 "Confirm"
//               )}
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


import React, { useRef, useEffect, useState } from "react";

export default function CameraInline({
  capturedImage,
  onCapture,
  onRetake,
  onConfirm,
  stage,
  confirmLoading = false,
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startBackCamera = async () => {
    try {
      let mediaStream;
      
      // First try with exact constraint for environment (back camera)
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (exactError) {
        // Fallback to regular environment constraint
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }
      
      setStream(mediaStream);
      setCameraError(null);
      setIsCameraReady(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      return mediaStream;
    } catch (error) {
      console.error("Back camera error:", error);
      setCameraError("Failed to access back camera. Please check permissions.");
      setIsCameraReady(false);
      
      // As a last resort, try any camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        setStream(fallbackStream);
        setIsCameraReady(true);
        setCameraError("Using fallback camera (back camera not available)");
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        
        return fallbackStream;
      } catch (fallbackError) {
        setCameraError("No camera available. Please check device permissions.");
        setIsCameraReady(false);
        return null;
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      startBackCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [capturedImage]);

  const handleCapture = () => {
    if (!videoRef.current || !isCameraReady) {
      alert("Camera is not ready. Please try again.");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Create mirrored image for natural preview
      const ctx = canvas.getContext("2d");
      // ctx.save();
      // ctx.translate(canvas.width, 0);
      // ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0);
      // ctx.restore();
      
      const image = canvas.toDataURL("image/jpeg", 0.8);
      onCapture(image);
    } catch (error) {
      console.error("Capture error:", error);
      alert("Failed to capture image. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        borderRadius: 16,
        // boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: 32,
        // width: "100%",
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 8,
          color: "#222",
          textAlign: "center",
        }}
      >
        {stage === "before" ? "Before Image" : "After Image"}
      </div>
      
      {/* Camera status indicator */}
      <div style={{
        fontSize: 12,
        color: cameraError && cameraError.includes("Using fallback") ? '#eab308' : 
               cameraError ? '#ef4444' : '#10b981',
        marginBottom: 10,
        textAlign: 'center',
        padding: '6px 12px',
        backgroundColor: cameraError && cameraError.includes("Using fallback") ? '#fefce8' : 
                        cameraError ? '#fef2f2' : '#f0fdf4',
        borderRadius: 6,
        border: `1px solid ${cameraError && cameraError.includes("Using fallback") ? '#fde047' : 
                cameraError ? '#fecaca' : '#bbf7d0'}`,
        width: "100%",
      }}>
        {cameraError ? (
          <span>⚠️ {cameraError}</span>
        ) : (
          <span>✓ Using back camera</span>
        )}
      </div>
      
      {!capturedImage ? (
        <>
          {cameraError && cameraError.includes("No camera available") ? (
            <div style={{
              width: 240,
              height: 180,
              borderRadius: 12,
              marginBottom: 18,
              background: "#f3f4f6",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              textAlign: 'center',
              padding: 20,
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
              <div>Camera not available</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Please check device permissions</div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: 240,
                height: 180,
                borderRadius: 12,
                marginBottom: 18,
                background: "#f3f4f6",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                // transform: "scaleX(-1)", // Mirror for natural preview
                objectFit: "cover",
              }}
            />
          )}
          
          <button
            style={{
              background: (cameraError && cameraError.includes("No camera available")) ? "#9ca3af" : "#10b981",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: 20,
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 8,
              cursor: (cameraError && cameraError.includes("No camera available")) ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
              transition: "all 0.2s",
              opacity: (cameraError && cameraError.includes("No camera available")) ? 0.7 : 1,
              width: "100%",
              maxWidth: 280,
            }}
            onClick={handleCapture}
            disabled={cameraError && cameraError.includes("No camera available")}
            onMouseOver={(e) => {
              if (!(cameraError && cameraError.includes("No camera available"))) {
                e.currentTarget.style.background = "#059669";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseOut={(e) => {
              if (!(cameraError && cameraError.includes("No camera available"))) {
                e.currentTarget.style.background = "#10b981";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {stage === "before" ? "Capture Before Image" : "Capture After Image"}
          </button>
        </>
      ) : (
        <>
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: 240,
              height: 180,
              borderRadius: 12,
              marginBottom: 18,
              background: "#f3f4f6",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", gap: 16, justifyContent: "center", width: "100%" }}>
            <button
              style={{
                background: "#f3f4f6",
                color: "#374151",
                padding: "12px 24px",
                borderRadius: 20,
                border: "none",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s",
                flex: 1,
                maxWidth: 130,
              }}
              onClick={onRetake}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Retake
            </button>
            <button
              style={{
                background: confirmLoading ? "#059669" : "#10b981",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: 20,
                border: "none",
                fontWeight: 600,
                fontSize: 15,
                cursor: confirmLoading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
                transition: "all 0.2s",
                opacity: confirmLoading ? 0.8 : 1,
                flex: 1,
                maxWidth: 130,
              }}
              onClick={onConfirm}
              disabled={confirmLoading}
              onMouseOver={(e) => {
                if (!confirmLoading) {
                  e.currentTarget.style.background = "#059669";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseOut={(e) => {
                if (!confirmLoading) {
                  e.currentTarget.style.background = "#10b981";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {confirmLoading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Loading...
                </span>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}