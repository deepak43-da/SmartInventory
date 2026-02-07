// import { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import { useNetworkStatus } from "../components/useNetworkStatus";
// import { toast } from "react-toastify";
// import { store, persistor } from "../redux/store";
// import useDailyISTCleanup from "../hooks/useDailyISTCleanup";
// import moment from "moment";
// import Version from "../components/Version";

// export default function TaskDetail() {
//   const { displayId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isOnline } = useNetworkStatus();
//   useDailyISTCleanup(store, persistor);

//   // Find the display by DisplayID from all schedules
//   const allDisplays = useSelector((state) =>
//     state.tasks.tasks.flatMap((s) => s.displays || []),
//   );
//   const display = allDisplays.find(
//     (d) => String(d.DisplayID) === String(displayId),
//   );
//   const { offlineImages, queue, networkStatus } = useSelector(
//     (state) => state.tasks,
//   );

//   const products = display?.products || [];
//   const imageData = display?.imageData || [];
//   const auth = localStorage.getItem("auth");
//   const [facing, setFacing] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false); // Track successful submission
//   const [imageSubmitting, setImageSubmitting] = useState(false);
//   const [selectedImageId, setSelectedImageId] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   // Bulk facing
//   const [bulkFacing, setBulkFacing] = useState("");
//   // Camera modal
//   const [showCameraModal, setShowCameraModal] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [cameraLoading, setCameraLoading] = useState(false);
//   const [cameraError, setCameraError] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   console.log(products, "products");
//   // Camera modal logic
//   const startCamera = async () => {
//     try {
//       stopCamera();
//       const constraints = {
//         video: {
//           facingMode: { ideal: "environment" },
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       };
//       let stream = await navigator.mediaDevices.getUserMedia(constraints);
//       streamRef.current = stream;
//       setCameraError(null);
//       setIsCameraReady(true);
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     } catch (error) {
//       setCameraError(
//         "Camera access denied or not available. Please check permissions.",
//       );
//       setIsCameraReady(false);
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setIsCameraReady(false);
//   };

//   const captureImage = () => {
//     if (!videoRef.current || !isCameraReady) {
//       toast.error("Camera is not ready. Please try again.");
//       return;
//     }
//     try {
//       const video = videoRef.current;
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const imageData = canvas.toDataURL("image/jpeg", 0.8);
//       setCapturedImage(imageData);
//       stopCamera();
//     } catch (error) {
//       toast.error("Failed to capture image. Please try again.");
//     }
//   };

//   const retakeImage = () => {
//     setCapturedImage(null);
//     startCamera();
//   };

//   useEffect(() => {
//     if (auth !== "true") {
//       localStorage.removeItem("auth");
//       localStorage.removeItem("id");
//       navigate("/");
//     }
//   }, [auth]);
//   console.log(queue ,isOnline, offlineImages.length, queue.length, "deepak");

//   // Initialize state from existing data
//   useEffect(() => {
//     if (products.length > 0) {
//       const initialFacing = {};
//       let allHasFacing = true;
//       products.forEach((p) => {
//         if (p.Facing !== undefined && p.Facing !== null) {
//           initialFacing[p.ID] = p.Facing;
//         } else {
//           allHasFacing = false;
//         }
//       });
//       setFacing((prev) => ({ ...prev, ...initialFacing }));

//       // If we have valid facing for all, or if we have images, consider it submitted
//       const hasImages = display?.imageData && display.imageData.length > 0 && display.imageData.some(img => img.DTOImage);
//       if (allHasFacing || hasImages) {
//         setIsSubmitted(true);
//       }
//     }
//   }, [products, display]); // Depend on display to re-run when switching displays

//   // Handle facing input change
//   const handleFacingChange = (id, value) => {
//     setFacing((prev) => ({ ...prev, [id]: value }));
//   };


//   // Submit facing values for all products
//   const handleSubmit = async () => {
//     setSubmitting(true);
//     const userId = localStorage.getItem("UserID");
//     const now = moment().format("YYYY-MM-DD HH:mm:ss");
//     const payload = products.map((p) => ({
//       ID: p.ID,
//       Facing: Number(facing[p.ID]),
//       DTOEntry: now,
//       UserID: Number(userId),
//     }));
//     // Validate all Facing fields
//     if (payload.some((p) => !p.Facing)) {
//       toast.error("Please enter Facing for all products");
//       setSubmitting(false);
//       return;
//     }
//     try {
//       if (isOnline) {
//         await fetch(
//           "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(payload),
//           },
//         );
//         toast.success("Submitted successfully");
//         setIsSubmitted(true);
//       } else {
//         dispatch({
//           type: "ADD_TO_SYNC_QUEUE",
//           payload: {
//             type: "QUANTITY_SUBMIT",
//             data: payload,
//             retryCount: 0,
//             maxRetries: 3,
//           },
//         });
//         toast.info("Saved offline. Will sync when online.");
//         setIsSubmitted(true);
//       }
//     } catch (e) {
//       toast.error("Submission failed");
//     }
//     setSubmitting(false);
//   };

//   // Apply to All Facing
//   const handleApplyAll = () => {
//     if (bulkFacing === "" || !/^\d+$/.test(bulkFacing)) {
//       toast.error("Please enter facing value");
//       return;
//     }
//     const updated = {};
//     products.forEach((p) => {
//       updated[p.ID] = bulkFacing;
//     });
//     setFacing(updated);
//   };

//   // Handle image submit for a given imageData entry
//   const handleImageSubmit = async (imgId, imageFile) => {
//     setImageSubmitting(true);
//     const userId = localStorage.getItem("id") || "1";
//     const now = moment().format("YYYY-MM-DD HH:mm:ss");
//     const formData = new FormData();
//     formData.append("ID", imgId);
//     formData.append("DTOImage", now);
//     formData.append("UserID", userId);
//     formData.append("Image", imageFile);
//     try {
//       if (isOnline) {
//         await fetch(
//           "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkImageUpload",
//           {
//             method: "POST",
//             body: formData,
//           },
//         );
//         toast.success("Image submitted");
//       } else {
//         dispatch({
//           type: "ADD_TO_SYNC_QUEUE",
//           payload: {
//             type: "IMAGE_UPLOAD",
//             data: {
//               ID: imgId,
//               DTOImage: now,
//               UserID: userId,
//               Image: imageFile,
//             },
//             retryCount: 0,
//             maxRetries: 3,
//           },
//         });
//         toast.info("Image saved offline. Will sync when online.");
//       }
//     } catch (e) {
//       toast.error("Image upload failed");
//     }
//     setImageSubmitting(false);
//   };

//   // Sync Offline Images
//   const handleSyncOfflineImages = async () => {
//     if (!isOnline) {
//       toast.error("You are offline. Cannot sync.");
//       return;
//     }

//     const imageTypes = queue.filter(q => q.type === "IMAGE_UPLOAD");
//     if (imageTypes.length === 0) {
//       toast.info("No offline images to sync.");
//       return;
//     }

//     toast.info(`Syncing ${imageTypes.length} images...`);

//     for (const item of imageTypes) {
//       try {
//         const formData = new FormData();
//         formData.append("ID", item.data.ID);
//         formData.append("DTOImage", item.data.DTOImage);
//         formData.append("UserID", item.data.UserID);
//         formData.append("Image", item.data.Image);

//         await fetch(
//           "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkImageUpload",
//           { method: "POST", body: formData }
//         );

//         // Success - remove from queue
//         dispatch({ type: "SYNC_SUCCESS", payload: item.id });

//         // Update local display state if this image belongs to the current display
//         const currentDisplayImage = imageData.find(img => img.ID === item.data.ID);
//         if (currentDisplayImage) {
//           dispatch({
//             type: "UPDATE_DISPLAY_IMAGE",
//             payload: {
//               displayId: display.DisplayID,
//               imageId: item.data.ID,
//               DTOImage: item.data.DTOImage,
//               ImageURL: URL.createObjectURL(item.data.Image),
//             },
//           });
//         }

//       } catch (error) {
//         console.error("Sync failed for item", item.id, error);
//         toast.error(`Failed to sync image for ID: ${item.data.ID}`);
//       }
//     }
//     toast.success("Sync loop completed");
//   };


//   // UI
//   return (
//     <div
//       style={{
//         ...styles.container,
//         backgroundColor: "var(--purple-bg)",
//         color: "var(--purple-dark)",
//       }}
//     >
//       {/* Header */}
//       <div
//         className="top-header fixed-header"
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           background: "var(--purple-main)",
//           color: "var(--text-light)",
//           borderRadius: 12,
//           padding: "12px 18px",
//           marginBottom: 12,
//         }}
//       >
//         <span
//           className="store-title"
//           style={{ fontWeight: 700, fontSize: 18, color: "var(--text-light)" }}
//         >
//           {localStorage.getItem("StoreName") || display?.StoreID || ""}
//         </span>
//         <div style={{ display: "flex", gap: "8px" }}>
//           <button
//             style={{
//               background: "var(--purple-accent)",
//               color: "var(--purple-main)",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 600,
//               border: "none",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onClick={handleSyncOfflineImages}
//           >
//             {/* Sync ({queue.filter(q => q.type === "QUANTITY_SUBMIT").length}) */}
//             Sync 
//           </button>
//           <button
//             style={{
//               background: "var(--purple-accent)",
//               color: "var(--purple-main)",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 600,
//               border: "none",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onClick={() => window.location.reload()}
//           >
//             Reload
//           </button>
//           <button
//             style={{
//               background: "#a279e9",
//               color: "var(--text-light)",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 600,
//               border: "none",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onClick={() => {
//               localStorage.removeItem("auth");
//               // localStorage.removeItem("id");
//               localStorage.removeItem("StoreID");
//               localStorage.removeItem("StoreName");
//               localStorage.removeItem("Type");
//               localStorage.removeItem("UserID");
//               localStorage.removeItem("maindata");
//               toast.error("Logout successful!");
//               navigate("/");
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>



//       {/* Display Info */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 16,
//           margin: "24px 0 16px 0",
//           backgroundColor: "var(--purple-main)",
//           borderRadius: "8px",  
//           padding: "12px 18px",
//         }}
//       >
//         {display.ImageURL ? (
//           <img
//             src={display.ImageURL}
//             alt={display.DisplayID}
//             style={{
//               width: "80px",
//               height: "80px",
//               objectFit: "cover",
//               borderRadius: "8px",
//             }}
//             onError={(e) => {
//               e.target.style.display = "none";
//             }}
//           />
//         ) : (
//           <div
//             style={{
//               width: "80px",
//               height: "80px",
//               borderRadius: "8px",
//               backgroundColor: "var(--purple-dark)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "white",
//               fontWeight: "bold",
//               fontSize: "14px",
//               textAlign: "center",
//               padding: "6px",
//               border: "1px solid #ffffff33",
//             }}
//           >
//             {display.DisplayID}
//           </div>
//         )}
//         <div>
//           <div style={{ fontSize: 18, fontWeight: 700 , color: "white" }}>
//             {display?.DisplayID}
//           </div>
//           <div style={{ fontSize: 14, color: "white" }}>
//             ScheduleID: {display?.ScheduleID} | Version: {display?.Version}
//           </div>
//         </div>
//       </div>

//       <div style={{ marginBottom: 24 }}>
//         {/* Take Image Button Logic */}
//         {display?.DisplayID !== "NOP" && isSubmitted && (<>
//         {/* {true && (<> */}
//           <h3 style={{ fontWeight: 600, fontSize: 16 }}>Display Images</h3>

//           <button
//             disabled={imageData.some((img) => img.DTOImage)}
//             onClick={() => {
//               setShowCameraModal(true);
//               setCapturedImage(null);
//               setCameraError(null);
//               setTimeout(startCamera, 100);
//             }}
//             style={{
//               backgroundColor: imageData.some((img) => img.DTOImage)
//                 ? "#9ca3af"
//                 : "var(--purple-main)",
//               color: "white",
//               padding: "12px 24px",
//               borderRadius: "8px",
//               border: "none",
//               fontWeight: 600,
//               fontSize: 16,
//               cursor: imageData.some((img) => img.DTOImage)
//                 ? "not-allowed"
//                 : "pointer",
//               width: "100%",
//               boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
//               marginBottom: 16,
//               opacity: imageData.some((img) => img.DTOImage) ? 0.7 : 1,
//             }}
//           >
//             {imageData.some((img) => img.DTOImage)
//               ? "Image Uploaded"
//               : "Take Image"}
//           </button></>
//         )}

//         {/* Camera Modal */}
//         {showCameraModal && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0, 0, 0, 0.9)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//               padding: 20,
//             }}
//           >
//             <div
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: 16,
//                 padding: 24,
//                 width: "100%",
//                 maxWidth: 500,
//                 maxHeight: "90vh",
//                 overflow: "auto",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginBottom: 20,
//                 }}
//               >
//                 <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
//                   Take Display Image
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowCameraModal(false);
//                     setCapturedImage(null);
//                     stopCamera();
//                   }}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     fontSize: 24,
//                     cursor: "pointer",
//                     color: "#6b7280",
//                     padding: 0,
//                     width: 30,
//                     height: 30,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     borderRadius: "50%",
//                     backgroundColor: "#f3f4f6",
//                   }}
//                 >
//                   ✕
//                 </button>
//               </div>
//               {/* Camera Component */}
//               {!capturedImage ? (
//                 <div>
//                   {cameraError ? (
//                     <div
//                       style={{
//                         textAlign: "center",
//                         padding: "40px 20px",
//                         backgroundColor: "#f3f4f6",
//                         borderRadius: 12,
//                         marginBottom: 16,
//                       }}
//                     >
//                       <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
//                       <div style={{ color: "#ef4444", marginBottom: 8 }}>
//                         {cameraError}
//                       </div>
//                       <button
//                         onClick={startCamera}
//                         style={{
//                           backgroundColor: "#3b82f6",
//                           color: "white",
//                           padding: "10px 20px",
//                           borderRadius: "8px",
//                           border: "none",
//                           fontWeight: 600,
//                           fontSize: 14,
//                           cursor: "pointer",
//                           marginTop: 8,
//                         }}
//                       >
//                         Try Again
//                       </button>
//                     </div>
//                   ) : (
//                     <div style={{ position: "relative" }}>
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         style={{
//                          width: "100%",
//                   height: "100%",
//                           borderRadius: 12,
//                           backgroundColor: "#000",
//                           marginBottom: 16,
//                           // aspectRatio: "4/3",
//                           // objectFit: "cover",
//                         }}
//                       />
//                       {!isCameraReady && (
//                         <div
//                           style={{
//                             position: "absolute",
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             backgroundColor: "rgba(0,0,0,0.5)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: "white",
//                             fontSize: 16,
//                           }}
//                         >
//                           Initializing camera...
//                         </div>
//                       )}
//                     </div>
//                   )}
//                   <button
//                     onClick={captureImage}
//                     disabled={!isCameraReady || cameraError}
//                     style={{
//                       backgroundColor:
//                         !isCameraReady || cameraError
//                           ? "#9ca3af"
//                           : "var(--purple-main)",
//                       color: "white",
//                       padding: "14px 24px",
//                       borderRadius: "8px",
//                       border: "none",
//                       fontWeight: 600,
//                       fontSize: 16,
//                       cursor:
//                         !isCameraReady || cameraError
//                           ? "not-allowed"
//                           : "pointer",
//                       width: "100%",
//                       opacity: !isCameraReady || cameraError ? 0.7 : 1,
//                     }}
//                   >
//                     {cameraError ? "Camera Not Available" : "Capture Image"}
//                   </button>
//                 </div>
//               ) : (
//                 <div>
//                   <img
//                     src={capturedImage}
//                     alt="Captured"
//                     style={{
//                       width: "100%",
//                   height: "100%",
//                       borderRadius: 12,
//                       marginBottom: 16,
//                       // aspectRatio: "4/3",
//                       // objectFit: "contain",
//                       backgroundColor: "#f3f4f6",
//                     }}
//                   />
//                   <div style={{ display: "flex", gap: 12 }}>
//                     <button
//                       onClick={retakeImage}
//                       style={{
//                         flex: 1,
//                         backgroundColor: "#f3f4f6",
//                         color: "#374151",
//                         padding: "14px",
//                         borderRadius: "8px",
//                         border: "none",
//                         fontWeight: 600,
//                         fontSize: 16,
//                         cursor: "pointer",
//                       }}
//                     >
//                       Retake
//                     </button>
//                     <button
//                       onClick={async () => {
//                         if (!capturedImage) return;
//                         const userId = localStorage.getItem("id") || "1";
//                         const now = moment().format("YYYY-MM-DD HH:mm:ss");
//                         const slotId = imageData[0]?.ID;
//                         if (!slotId) {
//                           toast.error("No image slot available");
//                           return;
//                         }
//                         // Convert base64 to Blob
//                         const arr = capturedImage.split(",");
//                         const mime = arr[0].match(/:(.*?);/)[1];
//                         const bstr = atob(arr[1]);
//                         let n = bstr.length;
//                         const u8arr = new Uint8Array(n);
//                         while (n--) u8arr[n] = bstr.charCodeAt(n);
//                         const imageFile = new File(
//                           [u8arr],
//                           `image_${Date.now()}.jpg`,
//                           { type: mime },
//                         );
//                         const formData = new FormData();
//                         formData.append("ID", slotId);
//                         formData.append("DTOImage", now);
//                         formData.append("UserID", userId);
//                         formData.append("Image", imageFile);
//                         try {
//                           if (isOnline) {
//                             await fetch(
//                               "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkImageUpload",
//                               { method: "POST", body: formData },
//                             );
//                             toast.success("Image submitted");
//                           } else {
//                             // Offline logic if needed, or rely on queue
//                             // existing dispatch logic here if it was separate, but here we are in inline function
//                             // Copying existing offline logic pattern if needed but simpler to just dispatch success for UI
//                           }

//                           // Update Redux to disable button immediately
//                           dispatch({
//                             type: "UPDATE_DISPLAY_IMAGE",
//                             payload: {
//                               displayId: display.DisplayID,
//                               imageId: slotId,
//                               DTOImage: now,
//                               ImageURL: URL.createObjectURL(imageFile), // Temporary local preview
//                             },
//                           });

//                           setShowCameraModal(false);
//                           setCapturedImage(null);
//                           stopCamera();
//                         } catch (e) {
//                           console.error(e); // Log error
//                           toast.error("Image upload failed");
//                         }
//                       }}
//                       style={{
//                         flex: 1,
//                         backgroundColor: "var(--purple-main)",
//                         color: "white",
//                         padding: "14px",
//                         borderRadius: "8px",
//                         border: "none",
//                         fontWeight: 600,
//                         fontSize: 16,
//                         cursor: "pointer",
//                       }}
//                     >
//                       Confirm
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Product List with Apply to All */}
//       <div style={{ marginBottom: 24 }}>
//         <h3 style={{ fontWeight: 600, fontSize: 16 }}>Product List</h3>
//         {products.length === 0 ? (
//           <div style={{ color: "#888", fontSize: 15 }}>
//             No products found for this display.
//           </div>
//         ) : (<>
//           <div>



//             <div
//               style={{
//                 display: "flex",
//                 gap: 12,
//                 alignItems: "center",
//                 marginBottom: 16,
//               }}
//             >
//               <label style={{ fontSize: 14, fontWeight: 500 }}>Facing:</label>
//               <input
//                 type="text"
//                 value={bulkFacing}
//                 onChange={(e) => setBulkFacing(e.target.value)}
//                 style={{
//                   width: 80,
//                   padding: "8px 12px",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "6px",
//                   fontSize: 16,
//                   textAlign: "center",
//                   backgroundColor: "#f9fafb",
//                   margin: "0px",
//                 }}
//                 placeholder="-"
//               />
//               <button
//                 onClick={handleApplyAll}
//                 style={{
//                   backgroundColor: "var(--purple-main)",
//                   color: "white",
//                   padding: "10px 18px",
//                   borderRadius: "8px",
//                   border: "none",
//                   fontWeight: 600,
//                   fontSize: 14,
//                   cursor: products.length === 0 ? "not-allowed" : "pointer",
//                   minWidth: 120,
//                   opacity: products.length === 0 ? 0.7 : 1,
//                 }}
//                 disabled={products.length === 0}
//               >
//                 Apply to All
//               </button>
//             </div>



//             {products.map((p) => (
//               <div
//                 key={p.ID}
//                 style={{
//                   border: "1px solid #e5e7eb",
//                   padding: 12,
//                   borderRadius: 8,
//                   marginBottom: 10,
//                   background: "#fff",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 16,
//                 }}
//               >
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: 600, fontSize: 15 }}>
//                     ArticleNo: {p.ArticleNo}
//                   </div>
//                   <div style={{ fontSize: 13, color: "#666" }}>
//                     UpcCode: {p.UpcCode}
//                   </div>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Facing"
//                   value={facing[p.ID] || ""}
//                   onChange={(e) => handleFacingChange(p.ID, e.target.value)}
//                   style={{
//                     width: 80,
//                     padding: "8px 12px",
//                     border: "1px solid #e5e7eb",
//                     borderRadius: 6,
//                     fontSize: 15,
//                     textAlign: "center",
//                     backgroundColor: "#f9fafb",
//                   }}
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handleSubmit}
//               disabled={submitting}
//               style={{
//                 backgroundColor: submitting ? "#9ca3af" : "var(--purple-main)",
//                 color: "white",
//                 padding: "14px 24px",
//                 borderRadius: "8px",
//                 border: "none",
//                 fontWeight: 600,
//                 fontSize: 16,
//                 cursor: submitting ? "not-allowed" : "pointer",
//                 width: "100%",
//                 opacity: submitting ? 0.7 : 1,
//                 marginTop: 10,
//                 marginBottom: "20px",
//               }}
//             >
//               {submitting ? "Submitting..." : "Submit"}
//             </button>

//           </div>
//             <div className="footer fixed-footer">
//              <Version/>
//              </div>
// </>

//         )}
//       </div>

//       {/* Image Upload Section and Camera Modal */}

//     </div>
//   );
// }

// const styles = {
//   container: {
//     backgroundColor: "var(--purple-bg)",
//     minHeight: "100vh",
//     padding: "16px",
//     fontFamily:
//       '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     color: "var(--purple-dark)",
//   },
// };


// import { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import { useNetworkStatus } from "../components/useNetworkStatus";
// import { captureImageWithOfflineSupport, syncQueue } from "../redux/actions/offlineActions";
// import { toast } from "react-toastify";
// import { store, persistor } from "../redux/store";
// import useDailyISTCleanup from "../hooks/useDailyISTCleanup";
// import moment from "moment";
// import Version from "../components/Version";

// export default function TaskDetail() {
//   const { displayId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isOnline } = useNetworkStatus();
//   useDailyISTCleanup(store, persistor);

//   // Find the display by DisplayID from all schedules
//   const allDisplays = useSelector((state) =>
//     state.tasks.tasks.flatMap((s) => s.displays || []),
//   );
//   const display = allDisplays.find(
//     (d) => String(d.DisplayID) === String(displayId),
//   );
//   const { offlineImages, queue, networkStatus } = useSelector(
//     (state) => state.tasks,
//   );

//   const products = display?.products || [];
//   const imageData = display?.imageData || [];
//   const auth = localStorage.getItem("auth");
//   const [facing, setFacing] = useState({});
//   const [facingErrors, setFacingErrors] = useState({}); // New state for tracking errors
//   const [submitting, setSubmitting] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false); // Track successful submission
//   const [imageSubmitting, setImageSubmitting] = useState(false);
//   const [selectedImageId, setSelectedImageId] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   // Bulk facing
//   const [bulkFacing, setBulkFacing] = useState("");
//   // Camera modal
//   const [showCameraModal, setShowCameraModal] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [cameraLoading, setCameraLoading] = useState(false);
//   const [cameraError, setCameraError] = useState(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   console.log(products, "products");
//   // Camera modal logic
//   const startCamera = async () => {
//     try {
//       stopCamera();
//       const constraints = {
//         video: {
//           facingMode: { ideal: "environment" },
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       };
//       let stream = await navigator.mediaDevices.getUserMedia(constraints);
//       streamRef.current = stream;
//       setCameraError(null);
//       setIsCameraReady(true);
//       if (videoRef.current) videoRef.current.srcObject = stream;
//     } catch (error) {
//       setCameraError(
//         "Camera access denied or not available. Please check permissions.",
//       );
//       setIsCameraReady(false);
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setIsCameraReady(false);
//   };

//   const captureImage = () => {
//     if (!videoRef.current || !isCameraReady) {
//       toast.error("Camera is not ready. Please try again.");
//       return;
//     }
//     try {
//       const video = videoRef.current;
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const imageData = canvas.toDataURL("image/jpeg", 0.8);
//       setCapturedImage(imageData);
//       stopCamera();
//     } catch (error) {
//       toast.error("Failed to capture image. Please try again.");
//     }
//   };

//   const retakeImage = () => {
//     setCapturedImage(null);
//     startCamera();
//   };

//   useEffect(() => {
//     if (auth !== "true") {
//       localStorage.removeItem("auth");
//       localStorage.removeItem("id");
//       navigate("/");
//     }
//   }, [auth]);
//   console.log(queue, isOnline, offlineImages.length, queue.length, "deepak");

//   // Initialize state from existing data
//   useEffect(() => {
//     if (products.length > 0) {
//       const initialFacing = {};
//       let allHasFacing = true;
//       products.forEach((p) => {
//         if (p.Facing !== undefined && p.Facing !== null) {
//           initialFacing[p.ID] = p.Facing;
//         } else {
//           allHasFacing = false;
//         }
//       });
//       setFacing((prev) => ({ ...prev, ...initialFacing }));

//       // If we have valid facing for all, or if we have images, consider it submitted
//       const hasImages = display?.imageData && display.imageData.length > 0 && display.imageData.some(img => img.DTOImage);
//       if (allHasFacing || hasImages) {
//         setIsSubmitted(true);
//       }
//     }
//   }, [products, display]); // Depend on display to re-run when switching displays

//   // Handle facing input change
//   const handleFacingChange = (id, value) => {
//     setFacing((prev) => ({ ...prev, [id]: value }));
//     // Clear error for this field when user starts typing
//     if (facingErrors[id]) {
//       setFacingErrors((prev) => ({ ...prev, [id]: false }));
//     }
//   };

//   // Submit facing values for all products
//   //   const handleSubmit = async () => {
//   //     setSubmitting(true);

//   //     // Reset errors
//   //     setFacingErrors({});

//   //     const userId = localStorage.getItem("UserID");
//   //     const now = moment().format("YYYY-MM-DD HH:mm:ss");

//   //     // Check for missing values
//   //     const errors = {};
//   //     let hasErrors = false;

//   //     products.forEach((p) => {
//   //       const facingValue = facing[p.ID];
//   //       if (!facingValue || facingValue.toString().trim() === "") {
//   //         errors[p.ID] = true;
//   //         hasErrors = true;
//   //       }
//   //     });

//   //     if (hasErrors) {
//   //       setFacingErrors(errors);
//   //       toast.error("Please enter Facing for all products");
//   //       setSubmitting(false);
//   //       return;
//   //     }
//   //     const payload = products.map((p) => ({
//   //       ID: p.ID,
//   //       Facing: Number(facing[p.ID]),
//   //       DTOEntry: now,
//   //       UserID: Number(userId),
//   //     }));

//   //     try {
//   //       if (isOnline) {



//   // const formData = new URLSearchParams();
//   // formData.append("jsonData", JSON.stringify(payload));

//   // await fetch(
//   //   "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
//   //   {
//   //     method: "POST",
//   //     headers: {
//   //       "Content-Type": "application/x-www-form-urlencoded",
//   //     },
//   //     body: formData.toString(),
//   //   }
//   // )
//   //   .then(res => res.text())
//   //   .then(data => console.log(data))
//   //   .catch(err => console.error(err));


//   //         toast.success("Submitted successfully");
//   //         setIsSubmitted(true);
//   //       } else {
//   //         dispatch({
//   //           type: "ADD_TO_SYNC_QUEUE",
//   //           payload: {
//   //             type: "QUANTITY_SUBMIT",
//   //             data: payload,
//   //             retryCount: 0,
//   //             maxRetries: 3,
//   //           },
//   //         });
//   //         toast.info("Saved offline. Will sync when online.");
//   //         setIsSubmitted(true);
//   //       }
//   //     } catch (e) {
//   //       toast.error("Submission failed");
//   //     }
//   //     setSubmitting(false);
//   //   };

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     setFacingErrors({});

//     const userId = localStorage.getItem("UserID");
//     const now = moment().format("YYYY-MM-DD HH:mm:ss");

//     const errors = {};
//     let hasErrors = false;

//     products.forEach((p) => {
//       const facingValue = facing[p.ID];
//       if (!facingValue || facingValue.toString().trim() === "") {
//         errors[p.ID] = true;
//         hasErrors = true;
//       }
//     });

//     if (hasErrors) {
//       setFacingErrors(errors);
//       toast.error("Please enter Facing for all products");
//       setSubmitting(false);
//       return;
//     }

//     const payload = products.map((p) => ({
//       ID: p.ID,
//       Facing: Number(facing[p.ID]),
//       DTOEntry: now,
//       UserID: Number(userId),
//     }));

//     try {
//       if (isOnline) {
//         const formData = new URLSearchParams();
//         formData.append("jsonData", JSON.stringify(payload));

//         const response = await fetch(
//           "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: formData.toString(),
//           }
//         );

//         if (!response.ok) throw new Error("Server error");
//         toast.success("Submitted successfully");
//       } else {
//         dispatch({
//           type: "ADD_TO_SYNC_QUEUE",
//           payload: {
//             type: "QUANTITY_SUBMIT",
//             data: payload,
//             retryCount: 0,
//             maxRetries: 3,
//           },
//         });
//         toast.info("Saved offline. Will sync when online.");
//       }

//       setIsSubmitted(true);
//       dispatch({
//         type: "UPDATE_PRODUCT_FACING",
//         payload: {
//           displayId: display.DisplayID,
//           facingData: payload,
//         },
//       });
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error("Submission failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };


//   // Apply to All Facing
//   const handleApplyAll = () => {
//     if (bulkFacing === "" || !/^\d+$/.test(bulkFacing)) {
//       toast.error("Please enter facing value");
//       return;
//     }
//     const updated = {};
//     products.forEach((p) => {
//       updated[p.ID] = bulkFacing;
//     });
//     setFacing(updated);
//     // Clear all errors when applying to all
//     setFacingErrors({});
//   };



//   // Sync Offline Images
//   const handleSyncOfflineImages = async () => {
//     if (!isOnline) {
//       toast.error("You are offline. Cannot sync.");
//       return;
//     }

//     if (queue.length === 0) {
//       toast.info("No items to sync.");
//       return;
//     }

//     toast.info(`Syncing ${queue.length} items...`);
//     const result = await dispatch(syncQueue());

//     if (result && result.synced > 0) {
//       toast.success(`Synced ${result.synced} items successfully.`);
//     } else if (result && result.failed > 0) {
//       toast.error(`Failed to sync ${result.failed} items.`);
//     } else {
//       toast.info("Nothing to sync.");
//     }
//   };

//   // Helper to check if all facing values are filled
//   const areAllFacingsFilled = () => {
//     return products.every(p => {
//       const value = facing[p.ID];
//       return value !== undefined && value !== null && value.toString().trim() !== "";
//     });
//   };

//   // UI
//   return (
//     <div
//       style={{
//         ...styles.container,
//         backgroundColor: "var(--purple-bg)",
//         color: "var(--purple-dark)",
//       }}
//     >
//       {/* Header */}
//       <div
//         className="top-header fixed-header"
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           background: "var(--purple-main)",
//           color: "var(--text-light)",
//           borderRadius: 12,
//           padding: "12px 18px",
//           marginBottom: 12,
//         }}
//       >
//         <span
//           className="store-title"
//           style={{ fontWeight: 700, fontSize: 18, color: "var(--text-light)" }}
//         >
//           {localStorage.getItem("StoreName") || display?.StoreID || ""}
//         </span>
//         <div style={{ display: "flex", gap: "8px" }}>
//           <button
//             style={{
//               background: "var(--purple-accent)",
//               color: "var(--purple-main)",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 600,
//               border: "none",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onClick={handleSyncOfflineImages}
//           >
//             Sync
//           </button>
//           <button
//             style={{
//               background: "var(--purple-accent)",
//               color: "var(--purple-main)",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 600,
//               border: "none",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onClick={() => window.location.reload()}
//           >
//             Reload
//           </button>
//           <button
//             style={{
//               background: "#a279e9",
//               color: "var(--text-light)",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 600,
//               border: "none",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onClick={() => {
//               localStorage.removeItem("auth");
//               // localStorage.removeItem("id");
//               localStorage.removeItem("StoreID");
//               localStorage.removeItem("StoreName");
//               localStorage.removeItem("Type");
//               localStorage.removeItem("UserID");
//               localStorage.removeItem("maindata");
//               toast.error("Logout successful!");
//               navigate("/");
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Display Info */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 16,
//           margin: "24px 0 16px 0",
//           backgroundColor: "var(--purple-main)",
//           borderRadius: "8px",
//           padding: "12px 18px",
//         }}
//       >
//         {display.ImageURL ? (
//           <img
//             src={display.ImageURL}
//             alt={display.DisplayID}
//             style={{
//               width: "80px",
//               height: "80px",
//               objectFit: "cover",
//               borderRadius: "8px",
//             }}
//             onError={(e) => {
//               e.target.style.display = "none";
//             }}
//           />
//         ) : (
//           <div
//             style={{
//               width: "80px",
//               height: "80px",
//               borderRadius: "8px",
//               backgroundColor: "var(--purple-dark)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "white",
//               fontWeight: "bold",
//               fontSize: "14px",
//               textAlign: "center",
//               padding: "6px",
//               border: "1px solid #ffffff33",
//             }}
//           >
//             {display.DisplayID}
//           </div>
//         )}
//         <div>
//           <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
//             {display?.DisplayID}
//           </div>
//           <div style={{ fontSize: 14, color: "white" }}>
//             ScheduleID: {display?.ScheduleID} | Version: {display?.Version}
//           </div>
//         </div>
//       </div>

//       <div style={{ marginBottom: 24 }}>
//         {/* Take Image Button Logic */}
//         {display?.DisplayID !== "NOP" && isSubmitted && (<>
//           <h3 style={{ fontWeight: 600, fontSize: 16 }}>Display Images</h3>

//           <button
//             disabled={imageData.some((img) => img.DTOImage)}
//             onClick={() => {
//               setShowCameraModal(true);
//               setCapturedImage(null);
//               setCameraError(null);
//               setTimeout(startCamera, 100);
//             }}
//             style={{
//               backgroundColor: imageData.some((img) => img.DTOImage)
//                 ? "#9ca3af"
//                 : "var(--purple-main)",
//               color: "white",
//               padding: "12px 24px",
//               borderRadius: "8px",
//               border: "none",
//               fontWeight: 600,
//               fontSize: 16,
//               cursor: imageData.some((img) => img.DTOImage)
//                 ? "not-allowed"
//                 : "pointer",
//               width: "100%",
//               boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
//               marginBottom: 16,
//               opacity: imageData.some((img) => img.DTOImage) ? 0.7 : 1,
//             }}
//           >
//             {imageData.some((img) => img.DTOImage)
//               ? "Image Uploaded"
//               : "Take Image"}
//           </button></>
//         )}

//         {/* Camera Modal */}
//         {showCameraModal && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0, 0, 0, 0.9)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//               padding: 20,
//             }}
//           >
//             <div
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: 16,
//                 padding: 24,
//                 width: "100%",
//                 maxWidth: 500,
//                 maxHeight: "90vh",
//                 overflow: "auto",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginBottom: 20,
//                 }}
//               >
//                 <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
//                   Take Display Image
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowCameraModal(false);
//                     setCapturedImage(null);
//                     stopCamera();
//                   }}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     fontSize: 24,
//                     cursor: "pointer",
//                     color: "#6b7280",
//                     padding: 0,
//                     width: 30,
//                     height: 30,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     borderRadius: "50%",
//                     backgroundColor: "#f3f4f6",
//                   }}
//                 >
//                   ✕
//                 </button>
//               </div>
//               {/* Camera Component */}
//               {!capturedImage ? (
//                 <div>
//                   {cameraError ? (
//                     <div
//                       style={{
//                         textAlign: "center",
//                         padding: "40px 20px",
//                         backgroundColor: "#f3f4f6",
//                         borderRadius: 12,
//                         marginBottom: 16,
//                       }}
//                     >
//                       <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
//                       <div style={{ color: "#ef4444", marginBottom: 8 }}>
//                         {cameraError}
//                       </div>
//                       <button
//                         onClick={startCamera}
//                         style={{
//                           backgroundColor: "#3b82f6",
//                           color: "white",
//                           padding: "10px 20px",
//                           borderRadius: "8px",
//                           border: "none",
//                           fontWeight: 600,
//                           fontSize: 14,
//                           cursor: "pointer",
//                           marginTop: 8,
//                         }}
//                       >
//                         Try Again
//                       </button>
//                     </div>
//                   ) : (
//                     <div style={{ position: "relative" }}>
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         style={{
//                           width: "100%",
//                           height: "100%",
//                           borderRadius: 12,
//                           backgroundColor: "#000",
//                           marginBottom: 16,
//                         }}
//                       />
//                       {!isCameraReady && (
//                         <div
//                           style={{
//                             position: "absolute",
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             backgroundColor: "rgba(0,0,0,0.5)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: "white",
//                             fontSize: 16,
//                           }}
//                         >
//                           Initializing camera...
//                         </div>
//                       )}
//                     </div>
//                   )}
//                   <button
//                     onClick={captureImage}
//                     disabled={!isCameraReady || cameraError}
//                     style={{
//                       backgroundColor:
//                         !isCameraReady || cameraError
//                           ? "#9ca3af"
//                           : "var(--purple-main)",
//                       color: "white",
//                       padding: "14px 24px",
//                       borderRadius: "8px",
//                       border: "none",
//                       fontWeight: 600,
//                       fontSize: 16,
//                       cursor:
//                         !isCameraReady || cameraError
//                           ? "not-allowed"
//                           : "pointer",
//                       width: "100%",
//                       opacity: !isCameraReady || cameraError ? 0.7 : 1,
//                     }}
//                   >
//                     {cameraError ? "Camera Not Available" : "Capture Image"}
//                   </button>
//                 </div>
//               ) : (
//                 <div>
//                   <img
//                     src={capturedImage}
//                     alt="Captured"
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       borderRadius: 12,
//                       marginBottom: 16,
//                       backgroundColor: "#f3f4f6",
//                     }}
//                   />
//                   <div style={{ display: "flex", gap: 12 }}>
//                     <button
//                       onClick={retakeImage}
//                       style={{
//                         flex: 1,
//                         backgroundColor: "#f3f4f6",
//                         color: "#374151",
//                         padding: "14px",
//                         borderRadius: "8px",
//                         border: "none",
//                         fontWeight: 600,
//                         fontSize: 16,
//                         cursor: "pointer",
//                       }}
//                     >
//                       Retake
//                     </button>
//                     <button
//                       onClick={async () => {
//                         if (!capturedImage) return;
//                         const userId = localStorage.getItem("UserID") || "1";
//                         const slotId = imageData[0]?.ID;
//                         if (!slotId) {
//                           toast.error("No image slot available");
//                           return;
//                         }

//                         const metadata = {
//                           userId: userId,
//                           displayId: display.DisplayID,
//                           imgId: slotId,
//                         };

//                         try {
//                           const result = await dispatch(captureImageWithOfflineSupport(capturedImage, metadata));
//                           if (result.success) {
//                             toast.success(isOnline ? "Image submitted" : "Image saved offline");
//                             setShowCameraModal(false);
//                             setCapturedImage(null);
//                             stopCamera();
//                           } else {
//                             toast.error(result.message || "Capture failed");
//                           }
//                         } catch (e) {
//                           console.error(e);
//                           toast.error("Image capture failed");
//                         }
//                       }}
//                       style={{
//                         flex: 1,
//                         backgroundColor: "var(--purple-main)",
//                         color: "white",
//                         padding: "14px",
//                         borderRadius: "8px",
//                         border: "none",
//                         fontWeight: 600,
//                         fontSize: 16,
//                         cursor: "pointer",
//                       }}
//                     >
//                       Confirm
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Product List with Apply to All */}
//       <div style={{ marginBottom: 24 }}>
//         <h3 style={{ fontWeight: 600, fontSize: 16 }}>Product List</h3>
//         {products.length === 0 ? (
//           <div style={{ color: "#888", fontSize: 15 }}>
//             No products found for this display.
//           </div>
//         ) : (<>
//           <div>
//             <div
//               style={{
//                 display: "flex",
//                 gap: 12,
//                 alignItems: "center",
//                 marginBottom: 16,
//               }}
//             >
//               <label style={{ fontSize: 14, fontWeight: 500 }}>Facing:</label>
//               <input
//                 type="text"
//                 value={bulkFacing}
//                 onChange={(e) => setBulkFacing(e.target.value)}
//                 style={{
//                   width: 80,
//                   padding: "8px 12px",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "6px",
//                   fontSize: 16,
//                   textAlign: "center",
//                   backgroundColor: products.some(p => facingErrors[p.ID])
//                     ? "#fef2f2" // Light red background if any error
//                     : "#f9fafb",
//                   margin: "0px",
//                 }}
//                 placeholder="-"
//               />
//               <button
//                 onClick={handleApplyAll}
//                 style={{
//                   backgroundColor: "var(--purple-main)",
//                   color: "white",
//                   padding: "10px 18px",
//                   borderRadius: "8px",
//                   border: "none",
//                   fontWeight: 600,
//                   fontSize: 14,
//                   cursor: products.length === 0 ? "not-allowed" : "pointer",
//                   minWidth: 120,
//                   opacity: products.length === 0 ? 0.7 : 1,
//                 }}
//                 disabled={products.length === 0}
//               >
//                 Apply to All
//               </button>
//             </div>

//             {products.map((p) => (
//               <div
//                 key={p.ID}
//                 style={{
//                   border: facingErrors[p.ID]
//                     ? "1px solid #ef4444" // Red border for error
//                     : "1px solid #e5e7eb",
//                   padding: 12,
//                   borderRadius: 8,
//                   marginBottom: 10,
//                   background: facingErrors[p.ID]
//                     ? "#fef2f2" // Light red background for error
//                     : "#fff",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 16,
//                   transition: "border-color 0.2s, background-color 0.2s",
//                 }}
//               >
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: 600, fontSize: 15 }}>
//                     ArticleNo: {p.ArticleNo}
//                   </div>
//                   <div style={{ fontSize: 13, color: "#666" }}>
//                     UpcCode: {p.UpcCode}
//                   </div>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Facing"
//                   value={facing[p.ID] || ""}
//                   onChange={(e) => handleFacingChange(p.ID, e.target.value)}
//                   style={{
//                     width: 80,
//                     padding: "8px 12px",
//                     border: facingErrors[p.ID]
//                       ? "2px solid #ef4444"  // Red border for error
//                       : "1px solid #e5e7eb", // Normal border
//                     borderRadius: 6,
//                     fontSize: 15,
//                     textAlign: "center",
//                     backgroundColor: facingErrors[p.ID]
//                       ? "#fef2f2"  // Light red background for error
//                       : "#f9fafb", // Normal background
//                     outline: "none",
//                     transition: "border-color 0.2s, background-color 0.2s",
//                   }}
//                   onFocus={(e) => {
//                     if (facingErrors[p.ID]) {
//                       e.target.style.borderColor = "#dc2626"; // Darker red on focus
//                     }
//                   }}
//                   onBlur={(e) => {
//                     if (facingErrors[p.ID]) {
//                       e.target.style.borderColor = "#ef4444"; // Original red on blur
//                     }
//                   }}
//                 />
//               </div>
//             ))}
//             <button
//               onClick={handleSubmit}
//               disabled={submitting || isSubmitted}
//               style={{
//                 backgroundColor: (submitting || isSubmitted) ? "#9ca3af" : "var(--purple-main)",
//                 color: "white",
//                 padding: "14px 24px",
//                 borderRadius: "8px",
//                 border: "none",
//                 fontWeight: 600,
//                 fontSize: 16,
//                 cursor: (submitting || isSubmitted) ? "not-allowed" : "pointer",
//                 width: "100%",
//                 opacity: (submitting || isSubmitted) ? 0.7 : 1,
//                 marginTop: 10,
//                 marginBottom: "20px",
//               }}
//             >
//               {submitting ? "Submitting..." : isSubmitted ? "Submitted" : "Submit"}
//             </button>
//           </div>
//           <div className="footer fixed-footer">
//             <Version />
//           </div>
//         </>)}
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     backgroundColor: "var(--purple-bg)",
//     minHeight: "100vh",
//     padding: "16px",
//     fontFamily:
//       '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     color: "var(--purple-dark)",
//   },
// };








import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../components/useNetworkStatus";
import { captureImageWithOfflineSupport, syncQueue } from "../redux/actions/offlineActions";
import { toast } from "react-toastify";
import { store, persistor } from "../redux/store";
import useDailyISTCleanup from "../hooks/useDailyISTCleanup";
import moment from "moment";
import Version from "../components/Version";

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
  const { offlineImages, queue, networkStatus } = useSelector(
    (state) => state.tasks,
  );

  const products = display?.products || [];
  const imageData = display?.imageData || [];
  const auth = localStorage.getItem("auth");
  const [facing, setFacing] = useState({});
  const [facingErrors, setFacingErrors] = useState({}); // New state for tracking errors
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track successful submission
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
  console.log(products, "products");
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
  console.log(products,queue, isOnline, offlineImages.length, queue.length, "deepak");

  // Initialize state from existing data
  useEffect(() => {
    if (products.length > 0) {
      const initialFacing = {};
      let allHasFacing = true;
      products.forEach((p) => {
        if (p.Facing !== undefined && p.Facing !== null) {
          initialFacing[p.ID] = p.Facing;
        } else {
          allHasFacing = false;
        }
      });
      setFacing((prev) => ({ ...prev, ...initialFacing }));

      // If we have valid facing for all, or if we have images, consider it submitted
      const hasImages = display?.imageData && display.imageData.length > 0 && display.imageData.some(img => img.DTOImage);
      if (allHasFacing || hasImages) {
        setIsSubmitted(true);
      }
    }
  }, [products, display]); // Depend on display to re-run when switching displays

  // Handle facing input change
  const handleFacingChange = (id, value) => {
    setFacing((prev) => ({ ...prev, [id]: value }));
    // Clear error for this field when user starts typing
    if (facingErrors[id]) {
      setFacingErrors((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Submit facing values for all products
  //   const handleSubmit = async () => {
  //     setSubmitting(true);

  //     // Reset errors
  //     setFacingErrors({});

  //     const userId = localStorage.getItem("UserID");
  //     const now = moment().format("YYYY-MM-DD HH:mm:ss");

  //     // Check for missing values
  //     const errors = {};
  //     let hasErrors = false;

  //     products.forEach((p) => {
  //       const facingValue = facing[p.ID];
  //       if (!facingValue || facingValue.toString().trim() === "") {
  //         errors[p.ID] = true;
  //         hasErrors = true;
  //       }
  //     });

  //     if (hasErrors) {
  //       setFacingErrors(errors);
  //       toast.error("Please enter Facing for all products");
  //       setSubmitting(false);
  //       return;
  //     }
  //     const payload = products.map((p) => ({
  //       ID: p.ID,
  //       Facing: Number(facing[p.ID]),
  //       DTOEntry: now,
  //       UserID: Number(userId),
  //     }));

  //     try {
  //       if (isOnline) {



  // const formData = new URLSearchParams();
  // formData.append("jsonData", JSON.stringify(payload));

  // await fetch(
  //   "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: formData.toString(),
  //   }
  // )
  //   .then(res => res.text())
  //   .then(data => console.log(data))
  //   .catch(err => console.error(err));


  //         toast.success("Submitted successfully");
  //         setIsSubmitted(true);
  //       } else {
  //         dispatch({
  //           type: "ADD_TO_SYNC_QUEUE",
  //           payload: {
  //             type: "QUANTITY_SUBMIT",
  //             data: payload,
  //             retryCount: 0,
  //             maxRetries: 3,
  //           },
  //         });
  //         toast.info("Saved offline. Will sync when online.");
  //         setIsSubmitted(true);
  //       }
  //     } catch (e) {
  //       toast.error("Submission failed");
  //     }
  //     setSubmitting(false);
  //   };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFacingErrors({});

    const userId = localStorage.getItem("UserID");
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    const errors = {};
    let hasErrors = false;

    products.forEach((p) => {
      const facingValue = facing[p.ID];
      if (!facingValue || facingValue.toString().trim() === "") {
        errors[p.ID] = true;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFacingErrors(errors);
      toast.error("Please enter Facing for all products");
      setSubmitting(false);
      return;
    }

    const payload = products.map((p) => ({
      ID: p.ID,
      Facing: Number(facing[p.ID]),
      DTOEntry: now,
      UserID: Number(userId),
    }));

    try {
      if (isOnline) {
        const formData = new URLSearchParams();
        formData.append("jsonData", JSON.stringify(payload));

        const response = await fetch(
          "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          }
        );

        if (!response.ok) throw new Error("Server error");
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

      setIsSubmitted(true);
      dispatch({
        type: "UPDATE_PRODUCT_FACING",
        payload: {
          displayId: display.DisplayID,
          facingData: payload,
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
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
    // Clear all errors when applying to all
    setFacingErrors({});
  };



  console.log(products, "products in TaskDetail");

  // Sync Offline Images
  const handleSyncOfflineImages = async () => {
    if (!isOnline) {
      toast.error("You are offline. Cannot sync.");
      return;
    }

    if (queue.length === 0) {
      toast.info("No items to sync.");
      return;
    }

    toast.info(`Syncing ${queue.length} items...`);
    const result = await dispatch(syncQueue());

    if (result && result.synced > 0) {
      toast.success(`Synced ${result.synced} items successfully.`);
    } else if (result && result.failed > 0) {
      toast.error(`Failed to sync ${result.failed} items.`);
    } else {
      toast.info("Nothing to sync.");
    }
  };

  // Helper to check if all facing values are filled
  const areAllFacingsFilled = () => {
    return products.every(p => {
      const value = facing[p.ID];
      return value !== undefined && value !== null && value.toString().trim() !== "";
    });
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
            onClick={handleSyncOfflineImages}
          >
            Sync
          </button>
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
          backgroundColor: "var(--purple-main)",
          borderRadius: "8px",
          padding: "12px 18px",
        }}
      >
        {display?.ImageURL ? (
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
          <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
            {display?.DisplayID}
          </div>
          <div style={{ fontSize: 14, color: "white" }}>
            ScheduleID: {display?.ScheduleID} | Version: {display?.Version}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        {/* Take Image Button Logic */}
        {display?.DisplayID !== "NOP" && isSubmitted && (<>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Display Images</h3>

          <button
            disabled={imageData.some((img) => img.DTOImage)}
            onClick={() => {
              setShowCameraModal(true);
              setCapturedImage(null);
              setCameraError(null);
              setTimeout(startCamera, 100);
            }}
            style={{
              backgroundColor: imageData.some((img) => img.DTOImage)
                ? "#9ca3af"
                : "var(--purple-main)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              fontSize: 16,
              cursor: imageData.some((img) => img.DTOImage)
                ? "not-allowed"
                : "pointer",
              width: "100%",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
              marginBottom: 16,
              opacity: imageData.some((img) => img.DTOImage) ? 0.7 : 1,
            }}
          >
            {imageData.some((img) => img.DTOImage)
              ? "Image Uploaded"
              : "Take Image"}
          </button></>
        )}

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
                          height: "100%",
                          borderRadius: 12,
                          backgroundColor: "#000",
                          marginBottom: 16,
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
                      height: "100%",
                      borderRadius: 12,
                      marginBottom: 16,
                      backgroundColor: "#f3f4f6",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
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
                        if (!capturedImage || imageSubmitting) return;
                        setImageSubmitting(true);

                        // Use a small timeout to allow React to render the loading state
                        // before the potentially heavy dispatch starts.
                        setTimeout(async () => {
                          const userId = localStorage.getItem("UserID") || "1";
                          const slotId = imageData[0]?.ID;
                          if (!slotId) {
                            toast.error("No image slot available");
                            setImageSubmitting(false);
                            return;
                          }

                          const metadata = {
                            userId: userId,
                            displayId: display.DisplayID,
                            imgId: slotId,
                          };

                          try {
                            const result = await dispatch(captureImageWithOfflineSupport(capturedImage, metadata));
                            if (result.success) {
                              toast.success(isOnline ? "Image submitted" : "Image saved offline");
                              setShowCameraModal(false);
                              setCapturedImage(null);
                              stopCamera();
                            } else {
                              toast.error(result.message || "Capture failed");
                            }
                          } catch (e) {
                            console.error(e);
                            toast.error("Image capture failed");
                          } finally {
                            setImageSubmitting(false);
                          }
                        }, 50);
                      }}
                      disabled={imageSubmitting}
                      style={{
                        flex: 1,
                        backgroundColor: imageSubmitting ? "#9ca3af" : "var(--purple-main)",
                        color: "white",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: imageSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {imageSubmitting ? "Confirming..." : "Confirm"}
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
        ) : (<>
          <div>
            {/* <div
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
                  backgroundColor: products.some(p => facingErrors[p.ID])
                    ? "#fef2f2" // Light red background if any error
                    : "#f9fafb",
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
            </div> */}

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <label style={{
                fontSize: 14,
                fontWeight: 500,
                color: isSubmitted ? "#9ca3af" : "inherit" // Grey label when disabled
              }}>
                Facing:
              </label>
              <input
                type="text"
                value={bulkFacing}
                onChange={(e) => setBulkFacing(e.target.value)}
                disabled={isSubmitted} // Disable bulk input
                style={{
                  width: 80,
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: 16,
                  textAlign: "center",
                  backgroundColor: products.some(p => facingErrors[p.ID])
                    ? "#fef2f2"
                    : isSubmitted
                      ? "#f3f4f6" // Grey background when disabled
                      : "#f9fafb",
                  margin: "0px",
                  cursor: isSubmitted ? "not-allowed" : "text", // Change cursor
                  color: isSubmitted ? "#6b7280" : "inherit", // Grey text when disabled
                }}
                placeholder="-"
              />
              <button
                onClick={handleApplyAll}
                disabled={products.length === 0 || isSubmitted} // Add isSubmitted condition
                style={{
                  backgroundColor: (products.length === 0 || isSubmitted)
                    ? "#9ca3af"
                    : "var(--purple-main)",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: (products.length === 0 || isSubmitted)
                    ? "not-allowed"
                    : "pointer",
                  minWidth: 120,
                  opacity: (products.length === 0 || isSubmitted) ? 0.7 : 1,
                }}
              >
                Apply to All
              </button>
            </div>

            {products.map((p) => (
              <div
                key={p.ID}
                style={{
                  border: facingErrors[p.ID]
                    ? "1px solid #ef4444" // Red border for error
                    : "1px solid #e5e7eb",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 10,
                  background: facingErrors[p.ID]
                    ? "#fef2f2" // Light red background for error
                    : isSubmitted // Check if form is submitted
                      ? "#f3f4f6" // Grey background when disabled
                      : "#fff", // Normal white background
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "border-color 0.2s, background-color 0.2s",
                  opacity: isSubmitted ? 0.7 : 1, // Add opacity when disabled
                }}
              >
                <div style={{ flex: 1 }}>

                <div style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: isSubmitted ? "#6b7280" : "inherit" // Grey text when disabled
                  }}>
                   <img src={p.ProductImageURL} alt="Product Image" style={{ width: 50, height: 50, borderRadius: 5 }}
                   
                   onError={(e) => {
                    e.target.style.display = "none";
                  }}
                   
                   />
               
                 
                </div>


                <div style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: isSubmitted ? "#6b7280" : "inherit" // Grey text when disabled
                  }}>
                    Product Name: {p.ProductName}
                  </div>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: isSubmitted ? "#9ca3af" : "#666" /// Grey text when disabled
                  }}>
                    ArticleNo: {p.ArticleNo}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: isSubmitted ? "#9ca3af" : "#666" // Lighter grey when disabled
                  }}>
                    UpcCode: {p.UpcCode}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Facing"
                  value={facing[p.ID] || ""}
                  onChange={(e) => handleFacingChange(p.ID, e.target.value)}
                  disabled={isSubmitted} // Disable input when form is submitted
                  style={{
                    width: 80,
                    padding: "8px 12px",
                    border: facingErrors[p.ID]
                      ? "2px solid #ef4444"
                      : isSubmitted
                        ? "1px solid #d1d5db" // Lighter border when disabled
                        : "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: 15,
                    textAlign: "center",
                    backgroundColor: facingErrors[p.ID]
                      ? "#fef2f2"
                      : isSubmitted
                        ? "#f3f4f6" // Grey background when disabled
                        : "#f9fafb",
                    outline: "none",
                    transition: "border-color 0.2s, background-color 0.2s",
                    cursor: isSubmitted ? "not-allowed" : "text", // Change cursor when disabled
                    color: isSubmitted ? "#6b7280" : "inherit", // Grey text when disabled
                  }}
                  onFocus={(e) => {
                    if (facingErrors[p.ID]) {
                      e.target.style.borderColor = "#dc2626";
                    }
                  }}
                  onBlur={(e) => {
                    if (facingErrors[p.ID]) {
                      e.target.style.borderColor = "#ef4444";
                    }
                  }}
                />
              </div>
            ))}
            {/* <button
              onClick={handleSubmit}
              disabled={submitting || isSubmitted}
              style={{
                backgroundColor: (submitting || isSubmitted) ? "#9ca3af" : "var(--purple-main)",
                color: "white",
                padding: "14px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: (submitting || isSubmitted) ? "not-allowed" : "pointer",
                width: "100%",
                opacity: (submitting || isSubmitted) ? 0.7 : 1,
                marginTop: 10,
                marginBottom: "20px",
              }}
            >
              {submitting ? "Submitting..." : isSubmitted ? "Submitted" : "Submit"}
            </button> */}

            <button
              onClick={handleSubmit}
              disabled={submitting || isSubmitted } // Also check if all facings are filled
              style={{
                backgroundColor: (submitting || isSubmitted)
                  ? "#9ca3af"
                  :"var(--purple-main)",
                color: "white",
                padding: "14px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                fontSize: 16,
                cursor: (submitting || isSubmitted )
                  ? "not-allowed"
                  : "pointer",
                width: "100%",
                opacity: (submitting || isSubmitted ) ? 0.7 : 1,
                marginTop: 10,
                marginBottom: "20px",
              }}
            >
              {submitting
                ? "Submitting..."
                : isSubmitted
                  ? "Submitted"
                  :  "Submit"
              }
            </button>

          </div>
          <div className="footer fixed-footer">
            <Version />
          </div>
        </>)}
      </div>
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