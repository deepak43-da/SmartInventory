// Only keep the correct TaskDetail export (the one at line 1793+)
// import DisplayListSection from "../components/DisplayListSection";
// //   useEffect(() => {
// //     dispatch({ type: "SET_CURRENT_TASK", payload: ActivityID });

// //     if (isCameraOpen) {
// //       startCamera();
// //     } else {
// //       stopCamera();
// //     }

// //     return () => {
// //       stopCamera();
// //     };
// //   }, [isCameraOpen, ActivityID, dispatch]);

// //   const startCamera = async () => {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({
// //         video: {
// //           facingMode: "environment",
// //           width: { ideal: 1280 },
// //           height: { ideal: 720 }
// //         }
// //       });

// //       streamRef.current = stream;
// //       setHasCameraPermission(true);

// //       if (videoRef.current) {
// //         videoRef.current.srcObject = stream;
// //       }
// //     } catch (err) {
// //       console.error("Camera error:", err);
// //       setHasCameraPermission(false);
// //       setIsCameraOpen(false);
// //     }
// //   };

// //   const stopCamera = () => {
// //     if (streamRef.current) {
// //       streamRef.current.getTracks().forEach(track => track.stop());
// //       streamRef.current = null;
// //     }
// //   };

// //   // Check total images count (online + offline) for the task
// //   const getTotalImagesCount = () => {
// //     return {
// //       during: capturedImages.duringActivity.length,
// //       post: capturedImages.postActivity.length,
// //       total: capturedImages.duringActivity.length + capturedImages.postActivity.length
// //     };
// //   };

// //   // Convert base64 to blob
// //   const base64ToBlob = (base64) => {
// //     const byteCharacters = atob(base64.split(',')[1]);
// //     const byteNumbers = new Array(byteCharacters.length);
// //     for (let i = 0; i < byteCharacters.length; i++) {
// //       byteNumbers[i] = byteCharacters.charCodeAt(i);
// //     }
// //     const byteArray = new Uint8Array(byteNumbers);
// //     return new Blob([byteArray], { type: 'image/jpeg' });
// //   };

// //   // Upload single image to API
// //   const uploadImageToAPI = async (imageData, stage, imageId) => {
// //     try {
// //       const blob = base64ToBlob(imageData);
// //       const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });

// //       const formData = new FormData();
// //       formData.append('ScheduleID', ScheduleID);
// //       formData.append('StoreID', StoreID);
// //       formData.append('ActivityID', ActivityID);
// //       formData.append('Stage', stage);
// //       formData.append('DTOImage', new Date().toISOString().replace('T', ' ').substring(0, 19));
// //       formData.append('UserID', '1');
// //       formData.append('Image', file);

// //       const response = await axios.post(
// //         "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/QCImageUpload",
// //         formData,
// //         {
// //           headers: {
// //             'Content-Type': 'multipart/form-data',
// //           },
// //           onUploadProgress: (progressEvent) => {
// //             const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
// //             setUploadProgress(prev => ({
// //               ...prev,
// //               [imageId]: percentCompleted
// //             }));
// //           }
// //         }
// //       );

// //       setUploadProgress(prev => {
// //         const newProgress = { ...prev };
// //         delete newProgress[imageId];
// //         return newProgress;
// //       });

// //       return response.data;
// //     } catch (error) {
// //       setUploadProgress(prev => {
// //         const newProgress = { ...prev };
// //         delete newProgress[imageId];
// //         return newProgress;
// //       });
// //       throw error;
// //     }
// //   };

// //   const captureImage = async () => {
// //     // Check if limit is reached for this task and tab
// //     const counts = getTotalImagesCount();

// //     if (activeTab === "during" && counts.during >= DURING_LIMIT) {
// //       alert(`Maximum ${DURING_LIMIT} images allowed for During Activity in this task`);
// //       return;
// //     }

// //     if (activeTab === "post" && counts.post >= POST_LIMIT) {
// //       alert(`Maximum ${POST_LIMIT} images allowed for Post Activity in this task`);
// //       return;
// //     }

// //     const video = videoRef.current;
// //     const canvas = canvasRef.current;

// //     if (!video || !canvas) {
// //       alert("Camera not ready. Please try again.");
// //       return;
// //     }

// //     try {
// //       canvas.width = Math.min(video.videoWidth, 1920);
// //       canvas.height = Math.min(video.videoHeight, 1080);

// //       const ctx = canvas.getContext("2d");
// //       ctx.save();
// //       ctx.translate(canvas.width, 0);
// //       ctx.scale(-1, 1);
// //       ctx.drawImage(video, 0, 0);
// //       ctx.restore();

// //       const imageData = canvas.toDataURL("image/jpeg", 0.7);
// //       const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// //       setIsCompressing(true);

// //       const stage = activeTab === "during" ? "Before" : "After";

// //       if (isOnline) {
// //         // Online: Upload immediately
// //         setIsUploading(true);
// //         try {
// //           await uploadImageToAPI(imageData, stage, imageId);

// //           // After successful upload, mark it in Redux (optional, for tracking)
// //           dispatch({
// //             type: "ADD_UPLOADED_IMAGE",
// //             payload: {
// //               taskId: ActivityID,
// //               imageData: imageData,
// //               tab: activeTab,
// //               timestamp: new Date().toISOString(),
// //               stage: stage,
// //               scheduleId: ScheduleID,
// //               storeId: StoreID,
// //               activityId: ActivityID,
// //               uploaded: true
// //             }
// //           });

// //           // alert("Image uploaded successfully!");
// //         } catch (uploadError) {
// //           console.error("Upload failed:", uploadError);
// //           // If upload fails, store in Redux for later retry
// //           storeImageOffline(imageData, stage);
// //           // alert("Upload failed. Image saved for offline sync.");
// //         } finally {
// //           setIsUploading(false);
// //         }
// //       } else {
// //         // Offline: Store in Redux
// //         storeImageOffline(imageData, stage);
// //         // alert("You are offline. Image saved locally and will sync when back online.");
// //       }

// //     } catch (error) {
// //       console.error("Error capturing image:", error);
// //       alert("Failed to capture image. Please try again.");
// //     } finally {
// //       setIsCompressing(false);
// //     }
// //   };

// //   const storeImageOffline = (imageData, stage) => {
// //     const timestamp = new Date().toISOString();

// //     dispatch({
// //       type: "CAPTURE_IMAGE",
// //       payload: {
// //         taskId: ActivityID,
// //         imageData: imageData,
// //         tab: activeTab,
// //         timestamp: timestamp,
// //         stage: stage,
// //         scheduleId: ScheduleID,
// //         storeId: StoreID,
// //         activityId: ActivityID,
// //         uploaded: false
// //       }
// //     });
// //   };

// //   const handleClearAll = () => {
// //     const counts = getTotalImagesCount();
// //     if (counts.total === 0) {
// //       alert("No images to clear.");
// //       return;
// //     }

// //     if (window.confirm(`Are you sure you want to clear all ${counts.total} images for this task?`)) {
// //       dispatch({ type: "CLEAR_TASK_IMAGES", payload: ActivityID });
// //       alert("All images cleared.");
// //     }
// //   };

// //   // Remove a specific offline image
// //   const removeOfflineImage = (index) => {

// //  dispatch({
// //         type: "REMOVE_IMAGE",
// //         payload: {
// //           taskId: ActivityID,
// //           tab: activeTab,
// //           index: index
// //         }
// //       });

// //     // if (window.confirm("Are you sure you want to delete this image?")) {
// //     //   dispatch({
// //     //     type: "REMOVE_IMAGE",
// //     //     payload: {
// //     //       taskId: ActivityID,
// //     //       tab: activeTab,
// //     //       index: index
// //     //     }
// //     //   });
// //     // }
// //   };

// //   if (!ActivityID) {
// //     return (
// //       <div style={styles.errorContainer}>
// //         <h2>Task Not Found</h2>
// //         <p>No task ID provided. Please go back to the task list.</p>
// //         <button
// //           style={styles.backButton}
// //           onClick={() => navigate("/tasks")}
// //         >
// //           Back to Tasks
// //         </button>
// //       </div>
// //     );
// //   }

// //   const counts = getTotalImagesCount();

// //   return (
// //     <div style={styles.container}>
// //       {/* Header */}
// //       <div style={styles.header}>
// //         <button
// //           style={styles.backButton}
// //           onClick={() => navigate(-1)}
// //         >
// //           ←
// //         </button>
// //         <h1 style={styles.mainTitle}>{Supplier} - {Activity}</h1>
// //       </div>

// //       {/* Tabs */}
// //       <div style={styles.tabContainer}>
// //         <button
// //           style={activeTab === "during" ? styles.activeTab : styles.inactiveTab}
// //           onClick={() => {
// //             setActiveTab("during");
// //             setIsCameraOpen(true);
// //           }}
// //           // disabled={counts.during >= DURING_LIMIT}
// //         >
// //           During Activity ({counts.during}/{DURING_LIMIT})
// //         </button>
// //         <button
// //           style={activeTab === "post" ? styles.activeTab1 : styles.inactiveTab}
// //           onClick={() => {
// //             setActiveTab("post");
// //             setIsCameraOpen(true);
// //           }}
// //           // disabled={counts.post >= POST_LIMIT}
// //         >
// //           Post Activity ({counts.post}/{POST_LIMIT})
// //         </button>
// //       </div>

// //       {/* Evidence Section */}
// //       <div style={ activeTab === "during" ? styles.evidenceSection  : styles.evidenceSections}>
// //         <div style={styles.sectionHeader}>
// //           <h2 style={styles.sectionTitle}>Capture Evidence</h2>
// //           {/* {counts.total > 0 && (
// //             <button
// //               style={styles.clearAllButton}
// //               onClick={handleClearAll}
// //             >
// //               Clear All
// //             </button>
// //           )} */}
// //         </div>

// //         {/* Image Limits Display */}
// //         <div style={styles.limitsContainer}>
// //           <div style={styles.limitItem}>
// //             <span style={styles.limitLabel}>During Activity:</span>
// //             <span style={counts.during >= DURING_LIMIT ? styles.limitReached : styles.limitCount}>
// //               {counts.during}/{DURING_LIMIT} {counts.during >= DURING_LIMIT && "✓"}
// //             </span>
// //           </div>
// //           <div style={styles.limitItem}>
// //             <span style={styles.limitLabel}>Post Activity:</span>
// //             <span style={counts.post >= POST_LIMIT ? styles.limitReached : styles.limitCount}>
// //               {counts.post}/{POST_LIMIT} {counts.post >= POST_LIMIT && "✓"}
// //             </span>
// //           </div>
// //         </div>

// //         {/* Camera Preview */}
// //         <div style={styles.imagePreview}>
// //           {isCameraOpen ? (
// //             <video
// //               ref={videoRef}
// //               autoPlay
// //               playsInline
// //               style={{
// //                 width: "100%",
// //                 height: "100%",
// //                 objectFit: "cover",
// //                 transform: "scaleX(-1)",
// //                 WebkitTransform: "scaleX(-1)"
// //               }}
// //             />
// //           ) : (
// //             <div style={styles.cameraOffPlaceholder}>
// //               <div style={styles.cameraOffIcon}>📷</div>
// //               <p style={styles.cameraOffText}>Camera is off</p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Status Indicators */}
// //         <div style={styles.statusContainer}>
// //           {!isOnline && (
// //             <div style={styles.offlineIndicator}>
// //               ⚠️ You are offline. Images will sync automatically when back online.
// //             </div>
// //           )}
// //           {isUploading && (
// //             <div style={styles.uploadingIndicator}>
// //               ⬆️ Uploading image... {uploadProgress && Object.values(uploadProgress)[0]}%
// //             </div>
// //           )}
// //           {isLimitReached && (
// //             <div style={styles.limitIndicator}>
// //               ⛔ Limit reached for {activeTab} activity. Cannot capture more images.
// //             </div>
// //           )}
// //         </div>

// //         {/* Compressing indicator */}
// //         {isCompressing && (
// //           <div style={styles.compressingOverlay}>
// //             <div style={styles.compressingSpinner}></div>
// //             <div style={styles.compressingText}>Processing image...</div>
// //           </div>
// //         )}

// //         {/* Capture Button */}
// //         {isCameraOpen && (
// //           <button
// //             style={{
// //               ...styles.captureButton,
// //               backgroundColor: isLimitReached ? '#9ca3af' : '#10b981',
// //               opacity: (isCompressing || isUploading || isLimitReached) ? 0.7 : 1
// //             }}
// //             onClick={captureImage}
// //             disabled={isLimitReached || isCompressing || isUploading}
// //           >
// //             {isLimitReached
// //   ? `Limit Reached (${currentImages.length}/${currentLimit})`
// //   : isCompressing
// //     ? '⏳ Processing...'
// //     : isUploading
// //       ? '⬆️ Uploading...'
// //       : ` ${activeTab === "during" ? "During Activity Image" : "Post Activity Image"} (${currentImages.length}/${currentLimit})`
// // }

// //           </button>
// //         )}

// //         {/* Offline Images List */}

// //       </div>

// //       {/* Bottom Summary */}
// //       <div style={styles.bottomSection}>
// //         <div style={styles.taskSummary}>
// //           <div style={styles.summaryItem}>
// //             During: {counts.during}/{DURING_LIMIT}
// //           </div>
// //           <div style={styles.summaryItem}>
// //             Post: {counts.post}/{POST_LIMIT}
// //           </div>
// //           <div style={styles.summaryItem}>
// //             Total: {counts.total}/25
// //           </div>
// //         </div>

// //         {!isOnline && (
// //           <div style={styles.offlineNotice}>
// //             <small>Network: Offline • Images will sync automatically when back online</small>
// //           </div>
// //         )}
// //       </div>

// //       <canvas ref={canvasRef} style={{ display: "none" }} />
// //     </div>
// //   );
// // }

// // const styles = {
// //   container: {
// //     backgroundColor: 'white',
// //     minHeight: '100vh',
// //     padding: '16px',
// //     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
// //     color: '#374151',
// //   },
// //   errorContainer: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     minHeight: '100vh',
// //     padding: '20px',
// //     textAlign: 'center',
// //   },
// //   header: {
// //     marginBottom: '24px',
// //     position: 'relative',
// //     display:"flex",

// //   },
// //   backButton: {
// //     // position: 'absolute',
// //     // left: '0',
// //     // top: '0',
// //     height:"10px",
// //     background: 'none',
// //     border: 'none',
// //     color: '#6b7280',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     cursor: 'pointer',
// //     padding: '8px 0',
// //     ':hover': {
// //       color: '#374151',
// //     },
// //     marginRight:"20px"
// //   },
// //   mainTitle: {
// //     fontSize: '20px',
// //     fontWeight: '600',
// //     color: '#111827',
// //     margin: '0 0 4px 0',
// //     lineHeight: '1.3',
// //     textAlign: 'center',
// //   },
// //   tabContainer: {
// //     display: 'flex',
// //     backgroundColor: '#f3f4f6',
// //     padding: '4px',
// //     borderRadius: '10px',
// //     marginBottom: '16px',
// //     gap: '4px',
// //   },
// //   activeTab: {
// //     flex: 1,
// //     padding: '12px 0',
// //     // backgroundColor: 'white',
// //     backgroundColor: "#e9ac3d",
// //     border: 'none',
// //     borderRadius: '8px',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#111827',
// //     cursor: 'pointer',
// //     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
// //   },
// //    activeTab1: {
// //     flex: 1,
// //     padding: '12px 0',
// //     // backgroundColor: 'white',
// //     backgroundColor: "#189918",
// //     border: 'none',
// //     borderRadius: '8px',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#111827',
// //     cursor: 'pointer',
// //     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
// //   },
// //   inactiveTab: {
// //     flex: 1,
// //     padding: '12px 0',
// //     backgroundColor: 'transparent',
// //     border: 'none',
// //     borderRadius: '8px',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#6b7280',
// //     cursor: 'pointer',
// //     ':hover': {
// //       backgroundColor: 'rgba(255, 255, 255, 0.5)',
// //     },
// //     ':disabled': {
// //       opacity: 0.5,
// //       cursor: 'not-allowed',
// //     }
// //   },
// //   evidenceSection: {
// //     backgroundColor: '#e9ac3d',
// //     borderRadius: '12px',
// //     padding: '20px',
// //     marginBottom: '16px',
// //     boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
// //     position: 'relative',
// //   },
// //   evidenceSections: {
// //     backgroundColor: '#189918',
// //     borderRadius: '12px',
// //     padding: '20px',
// //     marginBottom: '16px',
// //     boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
// //     position: 'relative',
// //   },
// //   sectionHeader: {
// //     display: 'flex',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: '16px',
// //   },
// //   sectionTitle: {
// //     fontSize: '18px',
// //     fontWeight: '600',
// //     // color: '#111827',
// //     color: 'white',
// //     margin: '0',
// //   },
// //   clearAllButton: {
// //     padding: '8px 16px',
// //     backgroundColor: '#fef2f2',
// //     border: '1px solid #fecaca',
// //     borderRadius: '6px',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#dc2626',
// //     cursor: 'pointer',
// //     ':hover:not(:disabled)': {
// //       backgroundColor: '#fee2e2',
// //     },
// //   },
// //   limitsContainer: {
// //     backgroundColor: '#f8fafc',
// //     padding: '12px',
// //     borderRadius: '8px',
// //     marginBottom: '16px',
// //     border: '1px solid #e2e8f0',
// //   },
// //   limitItem: {
// //     display: 'flex',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: '8px',
// //     fontSize: '14px',
// //   },
// //   limitLabel: {
// //     color: '#64748b',
// //   },
// //   limitCount: {
// //     color: '#059669',
// //     fontWeight: '600',
// //   },
// //   limitReached: {
// //     color: '#dc2626',
// //     fontWeight: '600',
// //   },
// //   imagePreview: {
// //     backgroundColor: '#000',
// //     borderRadius: '8px',
// //     height: '250px',
// //     marginBottom: '12px',
// //     border: '1px solid #e5e7eb',
// //     overflow: 'hidden',
// //     position: 'relative',
// //   },
// //   cameraOffPlaceholder: {
// //     width: '100%',
// //     height: '100%',
// //     display: 'flex',
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#f3f4f6',
// //     color: '#6b7280',
// //   },
// //   cameraOffIcon: {
// //     fontSize: '40px',
// //     marginBottom: '10px',
// //   },
// //   cameraOffText: {
// //     fontSize: '14px',
// //     margin: 0,
// //   },
// //   statusContainer: {
// //     marginBottom: '16px',
// //     minHeight: '40px',
// //   },
// //   offlineIndicator: {
// //     backgroundColor: '#fef3c7',
// //     border: '1px solid #fde68a',
// //     color: '#92400e',
// //     padding: '8px 12px',
// //     borderRadius: '6px',
// //     fontSize: '14px',
// //     marginBottom: '8px',
// //   },
// //   uploadingIndicator: {
// //     backgroundColor: '#dbeafe',
// //     border: '1px solid #bfdbfe',
// //     color: '#1e40af',
// //     padding: '8px 12px',
// //     borderRadius: '6px',
// //     fontSize: '14px',
// //     marginBottom: '8px',
// //   },
// //   limitIndicator: {
// //     backgroundColor: '#fee2e2',
// //     border: '1px solid #fecaca',
// //     color: '#991b1b',
// //     padding: '8px 12px',
// //     borderRadius: '6px',
// //     fontSize: '14px',
// //     marginBottom: '8px',
// //   },
// //   compressingOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
// //     display: 'flex',
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     zIndex: 10,
// //     borderRadius: '12px',
// //   },
// //   compressingSpinner: {
// //     width: '40px',
// //     height: '40px',
// //     border: '4px solid #f3f3f3',
// //     borderTop: '4px solid #10b981',
// //     borderRadius: '50%',
// //     animation: 'spin 1s linear infinite',
// //     marginBottom: '10px',
// //   },
// //   compressingText: {
// //     color: '#374151',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //   },
// //   captureButton: {
// //     width: '100%',
// //     padding: '14px 0',
// //     border: 'none',
// //     borderRadius: '10px',
// //     fontSize: '16px',
// //     fontWeight: '600',
// //     color: 'white',
// //     cursor: 'pointer',
// //     transition: 'all 0.2s',
// //     marginBottom: '16px',
// //     ':hover:not(:disabled)': {
// //       opacity: 0.9,
// //       transform: 'translateY(-1px)',
// //     },
// //     ':disabled': {
// //       cursor: 'not-allowed',
// //     }
// //   },
// //   offlineImagesContainer: {
// //     marginTop: '20px',
// //     paddingTop: '20px',
// //     borderTop: '1px solid #e5e7eb',
// //   },
// //   offlineImagesTitle: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#374151',
// //     margin: '0 0 12px 0',
// //   },
// //   offlineImagesGrid: {
// //     display: 'flex',
// //     flexWrap: 'wrap',
// //     gap: '8px',
// //   },
// //   offlineImageWrapper: {
// //     position: 'relative',
// //     width: '60px',
// //     height: '60px',
// //     borderRadius: '8px',
// //     overflow: 'hidden',
// //     border: '2px solid #e5e7eb',
// //   },
// //   offlineImage: {
// //     width: '100%',
// //     height: '100%',
// //     objectFit: 'cover',
// //     backgroundColor: '#f3f4f6',
// //   },
// //   offlineImageInfo: {
// //     position: 'absolute',
// //     top: '2px',
// //     left: '2px',
// //     display: 'flex',
// //     alignItems: 'center',
// //     gap: '4px',
// //   },
// //   imageIndex: {
// //     backgroundColor: 'rgba(0, 0, 0, 0.7)',
// //     color: 'white',
// //     fontSize: '10px',
// //     padding: '2px 4px',
// //     borderRadius: '4px',
// //   },
// //   uploadedBadge: {
// //     backgroundColor: '#10b981',
// //     color: 'white',
// //     fontSize: '10px',
// //     width: '14px',
// //     height: '14px',
// //     borderRadius: '50%',
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   uploadProgress: {
// //     backgroundColor: 'rgba(59, 130, 246, 0.9)',
// //     color: 'white',
// //     fontSize: '8px',
// //     padding: '2px 4px',
// //     borderRadius: '4px',
// //   },
// //   removeImageButton: {
// //     position: 'absolute',
// //     bottom: '2px',
// //     right: '2px',
// //     backgroundColor: 'rgba(239, 68, 68, 0.9)',
// //     color: 'white',
// //     border: 'none',
// //     borderRadius: '50%',
// //     width: '18px',
// //     height: '18px',
// //     fontSize: '12px',
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     cursor: 'pointer',
// //     padding: 0,
// //     ':hover': {
// //       backgroundColor: '#ef4444',
// //       transform: 'scale(1.1)',
// //     }
// //   },
// //   bottomSection: {
// //     padding: '0 4px',
// //   },
// //   taskSummary: {
// //     display: 'flex',
// //     justifyContent: 'space-around',
// //     backgroundColor: '#f9fafb',
// //     borderRadius: '8px',
// //     padding: '12px',
// //     fontSize: '14px',
// //     color: '#374151',
// //     marginBottom: '8px',
// //   },
// //   summaryItem: {
// //     fontWeight: '500',
// //   },
// //   offlineNotice: {
// //     textAlign: 'center',
// //     color: '#6b7280',
// //     fontSize: '12px',
// //     padding: '8px',
// //     backgroundColor: '#f3f4f6',
// //     borderRadius: '6px',
// //   }
// // };

// // // Add to your component or global CSS
// // const globalStyles = `
// //   @keyframes spin {
// //     0% { transform: rotate(0deg); }
// //     100% { transform: rotate(360deg); }
// //   }
// // `;

// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import { useNetworkStatus } from "../components/useNetworkStatus";
// import axios from "axios";

// export default function TaskDetail() {
//   const {
//     Store,
//     ActivityID,
//     StoreID,
//     ScheduleID,
//     SupplierID,
//     Supplier,
//     Activity,
//     Duration,
//     DOWork,
//   } = useParams();
//   console.log(DOWork, "DOWork");
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("during");
//   const [isCameraOpen, setIsCameraOpen] = useState(true);
//   const [isCompressing, setIsCompressing] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [hasCameraPermission, setHasCameraPermission] = useState(true);
//   const [uploadProgress, setUploadProgress] = useState({});
//   // Always use back camera (environment)

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);

//   const dispatch = useDispatch();
//   const { isOnline } = useNetworkStatus();

//   // Get images for current user and task, using ScheduleID as the unique task key
//   const capturedImages = useSelector((state) => {
//     const userTasks = state.capturedImages.userTasks[StoreID] || {};
//     return userTasks[ScheduleID] || { duringActivity: [], postActivity: [] };
//   });

//   const currentImages =
//     activeTab === "during"
//       ? capturedImages.duringActivity
//       : capturedImages.postActivity;

//   const DURING_LIMIT = 5;
//   const POST_LIMIT = 20;
//   const currentLimit = activeTab === "during" ? DURING_LIMIT : POST_LIMIT;

//   const isLimitReached = currentImages.length >= currentLimit;

//   useEffect(() => {
//     // Set current user and task in Redux
//     dispatch({
//       type: "SET_CURRENT_USER_AND_TASK",
//       payload: {
//         userId: StoreID,
//         taskId: ActivityID,
//       },
//     });

//     if (isCameraOpen) {
//       startCamera();
//     } else {
//       stopCamera();
//     }

//     return () => {
//       stopCamera();
//     };
//   }, [isCameraOpen, ActivityID, StoreID, dispatch]);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: { exact: "environment" },
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       });

//       streamRef.current = stream;
//       setHasCameraPermission(true);

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (err) {
//       // Fallback: try without exact constraint if not supported
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: "environment",
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//           },
//         });
//         streamRef.current = stream;
//         setHasCameraPermission(true);
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (err2) {
//         console.error("Camera error:", err2);
//         setHasCameraPermission(false);
//         setIsCameraOpen(false);
//       }
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//   };

//   const getTotalImagesCount = () => {
//     return {
//       during: capturedImages.duringActivity.length,
//       post: capturedImages.postActivity.length,
//       total:
//         capturedImages.duringActivity.length +
//         capturedImages.postActivity.length,
//     };
//   };

//   const base64ToBlob = (base64) => {
//     const byteCharacters = atob(base64.split(",")[1]);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     return new Blob([byteArray], { type: "image/jpeg" });
//   };

//   const uploadImageToAPI = async (imageData, stage, imageId) => {
//     try {
//       const blob = base64ToBlob(imageData);
//       const file = new File([blob], `image_${Date.now()}.jpg`, {
//         type: "image/jpeg",
//       });

//       const formData = new FormData();
//       formData.append("ScheduleID", ScheduleID);
//       formData.append("DOWork", DOWork);
//       formData.append("StoreID", StoreID);
//       formData.append("ActivityID", ActivityID);
//       formData.append("Stage", stage);
//       formData.append(
//         "DTOImage",
//         new Date().toISOString().replace("T", " ").substring(0, 19)
//       );
//       formData.append("UserID", "1");
//       formData.append("Image", file);

//       const response = await axios.post(
//         "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/QCImageUpload",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           onUploadProgress: (progressEvent) => {
//             const percentCompleted = Math.round(
//               (progressEvent.loaded * 100) / progressEvent.total
//             );
//             setUploadProgress((prev) => ({
//               ...prev,
//               [imageId]: percentCompleted,
//             }));
//           },
//         }
//       );

//       setUploadProgress((prev) => {
//         const newProgress = { ...prev };
//         delete newProgress[imageId];
//         return newProgress;
//       });

//       return response.data;
//     } catch (error) {
//       setUploadProgress((prev) => {
//         const newProgress = { ...prev };
//         delete newProgress[imageId];
//         return newProgress;
//       });
//       throw error;
//     }
//   };

//   const auth = localStorage.getItem("auth");

//   useEffect(() => {
//     if (auth !== "true") {
//       localStorage.removeItem("auth");
//       localStorage.removeItem("id");
//       navigate("/");
//     }
//   }, [auth]);

//   const captureImage = async () => {
//     const counts = getTotalImagesCount();

//     if (activeTab === "during" && counts.during >= DURING_LIMIT) {
//       alert(
//         `Maximum ${DURING_LIMIT} images allowed for During Activity in this task`
//       );
//       return;
//     }

//     if (activeTab === "post" && counts.post >= POST_LIMIT) {
//       alert(
//         `Maximum ${POST_LIMIT} images allowed for Post Activity in this task`
//       );
//       return;
//     }

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas) {
//       alert("Camera not ready. Please try again.");
//       return;
//     }

//     try {
//       canvas.width = Math.min(video.videoWidth, 1920);
//       canvas.height = Math.min(video.videoHeight, 1080);

//       const ctx = canvas.getContext("2d");
//       ctx.save();
//       ctx.translate(canvas.width, 0);
//       ctx.scale(-1, 1);
//       ctx.drawImage(video, 0, 0);
//       ctx.restore();

//       const imageData = canvas.toDataURL("image/jpeg", 0.7);
//       const imageId = `${StoreID}-${ActivityID}-${activeTab}-${Date.now()}`;

//       setIsCompressing(true);

//       const stage = activeTab === "during" ? "Before" : "After";

//       if (isOnline) {
//         setIsUploading(true);
//         try {
//           await uploadImageToAPI(imageData, stage, imageId);

//           dispatch({
//             type: "ADD_UPLOADED_IMAGE",
//             payload: {
//               userId: StoreID,
//               taskId: ScheduleID, // Use ScheduleID for unique task
//               imageData: imageData,
//               tab: activeTab,
//               timestamp: new Date().toISOString(),
//               stage: stage,
//               scheduleId: ScheduleID,
//               storeId: StoreID,
//               activityId: ActivityID,
//               DOWork: DOWork,
//             },
//           });
//         } catch (uploadError) {
//           console.error("Upload failed:", uploadError);
//           storeImageOffline(imageData, stage);
//           // alert("Upload failed. Image saved for offline sync.");
//         } finally {
//           setIsUploading(false);
//         }
//       } else {
//         storeImageOffline(imageData, stage);
//         // alert("You are offline. Image saved locally and will sync when back online.");
//       }
//     } catch (error) {
//       console.error("Error capturing image:", error);
//       alert("Failed to capture image. Please try again.");
//     } finally {
//       setIsCompressing(false);
//     }
//   };

//   const storeImageOffline = (imageData, stage) => {
//     const timestamp = new Date().toISOString();

//     dispatch({
//       type: "CAPTURE_IMAGE",
//       payload: {
//         userId: StoreID,
//         taskId: ScheduleID, // Use ScheduleID for unique task
//         imageData: imageData,
//         tab: activeTab,
//         timestamp: timestamp,
//         stage: stage,
//         scheduleId: ScheduleID,
//         storeId: StoreID,
//         activityId: ActivityID,
//         DOWork: DOWork,
//       },
//     });
//   };

//   const handleClearAll = () => {
//     const counts = getTotalImagesCount();
//     if (counts.total === 0) {
//       alert("No images to clear.");
//       return;
//     }

//     if (
//       window.confirm(
//         `Are you sure you want to clear all ${counts.total} images for this task?`
//       )
//     ) {
//       dispatch({
//         type: "CLEAR_USER_TASK_IMAGES",
//         payload: {
//           userId: StoreID,
//           taskId: ScheduleID, // Use ScheduleID for unique task
//         },
//       });
//       alert("All images cleared.");
//     }
//   };

//   const removeOfflineImage = (index) => {
//     dispatch({
//       type: "REMOVE_IMAGE",
//       payload: {
//         userId: StoreID,
//         taskId: ScheduleID, // Use ScheduleID for unique task
//         tab: activeTab,
//         index: index,
//       },
//     });
//   };

//   if (!ActivityID) {
//     return (
//       <div style={styles.errorContainer}>
//         <h2>Task Not Found</h2>
//         <p>No task ID provided. Please go back to the task list.</p>
//         <button style={styles.backButton} onClick={() => navigate("/tasks")}>
//           Back to Tasks
//         </button>
//       </div>
//     );
//   }
//   const counts = getTotalImagesCount();

// Display list is now included in the tasks data from DailySchedule_Get
// Use Redux to get the current task and its Displays

//   return (
//     <div style={styles.container}>
//       {/* Header (like TaskList) */}
//       <div
//         className="top-header fixed-header"
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <span className="store-title">{Store || ""}</span>
//         <div style={{ display: "flex", gap: "8px" }}>
//           <button
//             style={{
//               backgroundColor: "#10b981",
//               color: "white",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 500,
//               border: "none",
//               cursor: "pointer",
//             }}
//             onClick={() => window.location.reload()}
//           >
//             Reload
//           </button>
//           <button
//             style={{
//               backgroundColor: "rgb(228, 60, 60)",
//               color: "white",
//               padding: "10px 18px",
//               borderRadius: "20px",
//               fontSize: "13px",
//               fontWeight: 500,
//               border: "none",
//               cursor: "pointer",
//             }}
//             onClick={() => {
//               localStorage.removeItem("auth");
//               localStorage.removeItem("id");
//               window.location.href = "/";
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           margin: "24px 0 16px 0",
//         }}
//       >
//         <div
//           style={{
//             background: "#fff",
//             borderRadius: "14px",
//             boxShadow: "0 4px 16px rgba(34,197,94,0.10)",
//             padding: "16px 24px 12px 24px",
//             minWidth: "220px",
//             maxWidth: "340px",
//             textAlign: "center",
//             fontWeight: 600,
//             color: "#189918",
//             border: "1px solid #e5e7eb",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: "6px",
//           }}
//         >
//           <div
//             style={{
//               fontSize: "17px",
//               fontWeight: 700,
//               color: "#189918",
//               marginBottom: "2px",
//               letterSpacing: "0.5px",
//             }}
//           >
//             {Supplier}
//           </div>
//           <div
//             style={{
//               fontSize: "15px",
//               fontWeight: 500,
//               color: "#374151",
//               marginBottom: "4px",
//             }}
//           >
//             {Activity}
//           </div>
//           <div
//             style={{
//               fontSize: "14px",
//               fontWeight: 500,
//               color: "#10b981",
//               background: "#f3f4f6",
//               borderRadius: "8px",
//               padding: "6px 14px",
//               marginTop: "2px",
//               boxShadow: "0 1px 4px rgba(16,185,129,0.04)",
//             }}
//           >
//             Hrs Book: {Duration} hrs
//           </div>
//         </div>
//       </div>
//       {/* Display List Section */}
//       <DisplayListSection
//         ActivityID={ActivityID}
//         StoreID={StoreID}
//         ScheduleID={ScheduleID}
//         displayList={displayList}
//         loadingDisplayList={loadingDisplayList}
//         DOWork={DOWork}
//         SupplierID={SupplierID}
//         setDisplayList={setDisplayList}
//       />
//     </div>
//   );
// }

// const styles = {
//   timeSection: {
//     display: "flex",
//     justifyContent: "center",
//     backgroundColor: "white",
//     fontFamily:
//       '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     color: "#374151",
//     marginBottom: "20px",
//   },
//   container: {
//     backgroundColor: "white",
//     minHeight: "100vh",
//     padding: "16px",
//     fontFamily:
//       '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     color: "#374151",
//   },
//   errorContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: "100vh",
//     padding: "20px",
//     textAlign: "center",
//   },
//   header: {
//     position: "relative",
//     display: "flex",
//   },
//   backButton: {
//     height: "10px",
//     background: "none",
//     border: "none",
//     color: "#6b7280",
//     fontSize: "14px",
//     fontWeight: "500",
//     cursor: "pointer",
//     padding: "8px 0",
//     ":hover": {
//       color: "#374151",
//     },
//     marginRight: "20px",
//   },
//   mainTitle: {
//     fontSize: "20px",
//     fontWeight: "600",
//     color: "#111827",
//     margin: "0 0 4px 0",
//     lineHeight: "1.3",
//     textAlign: "center",
//   },
//   tabContainer: {
//     display: "flex",
//     backgroundColor: "#f3f4f6",
//     padding: "4px",
//     borderRadius: "10px",
//     marginBottom: "16px",
//     gap: "4px",
//   },
//   activeTab: {
//     flex: 1,
//     padding: "12px 0",
//     backgroundColor: "#e9ac3d",
//     border: "none",
//     borderRadius: "8px",
//     fontSize: "14px",
//     fontWeight: "500",
//     color: "#111827",
//     cursor: "pointer",
//     boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//   },
//   activeTab1: {
//     flex: 1,
//     padding: "12px 0",
//     backgroundColor: "#189918",
//     border: "none",
//     borderRadius: "8px",
//     fontSize: "14px",
//     fontWeight: "500",
//     color: "#111827",
//     cursor: "pointer",
//     boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//   },
//   inactiveTab: {
//     flex: 1,
//     padding: "12px 0",
//     backgroundColor: "transparent",
//     border: "none",
//     borderRadius: "8px",
//     fontSize: "14px",
//     fontWeight: "500",
//     color: "#6b7280",
//     cursor: "pointer",
//     ":hover": {
//       backgroundColor: "rgba(255, 255, 255, 0.5)",
//     },
//     ":disabled": {
//       opacity: 0.5,
//       cursor: "not-allowed",
//     },
//   },
//   evidenceSection: {
//     backgroundColor: "#e9ac3d",
//     borderRadius: "12px",
//     padding: "20px",
//     marginBottom: "16px",
//     boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
//     position: "relative",
//   },
//   evidenceSections: {
//     backgroundColor: "#189918",
//     borderRadius: "12px",
//     padding: "20px",
//     marginBottom: "16px",
//     boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
//     position: "relative",
//   },
//   sectionHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "16px",
//   },
//   sectionTitle: {
//     fontSize: "18px",
//     fontWeight: "600",
//     color: "white",
//     margin: "0",
//   },
//   limitsContainer: {
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     padding: "12px",
//     borderRadius: "8px",
//     marginBottom: "16px",
//     border: "1px solid rgba(255, 255, 255, 0.3)",
//   },
//   limitItem: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "8px",
//     fontSize: "14px",
//     color: "white",
//   },
//   limitLabel: {
//     color: "rgba(255, 255, 255, 0.9)",
//   },
//   limitCount: {
//     color: "#d1fae5",
//     fontWeight: "600",
//   },
//   limitReached: {
//     color: "#fecaca",
//     fontWeight: "600",
//   },
//   imagePreview: {
//     backgroundColor: "#000",
//     borderRadius: "8px",
//     height: "250px",
//     marginBottom: "12px",
//     border: "1px solid #e5e7eb",
//     overflow: "hidden",
//     position: "relative",
//   },
//   cameraOffPlaceholder: {
//     width: "100%",
//     height: "100%",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f3f4f6",
//     color: "#6b7280",
//   },
//   cameraOffIcon: {
//     fontSize: "40px",
//     marginBottom: "10px",
//   },
//   cameraOffText: {
//     fontSize: "14px",
//     margin: 0,
//   },
//   statusContainer: {
//     marginBottom: "16px",
//     minHeight: "40px",
//   },
//   offlineIndicator: {
//     backgroundColor: "#fef3c7",
//     border: "1px solid #fde68a",
//     color: "#92400e",
//     padding: "8px 12px",
//     borderRadius: "6px",
//     fontSize: "14px",
//     marginBottom: "8px",
//   },
//   uploadingIndicator: {
//     backgroundColor: "#dbeafe",
//     border: "1px solid #bfdbfe",
//     color: "#1e40af",
//     padding: "8px 12px",
//     borderRadius: "6px",
//     fontSize: "14px",
//     marginBottom: "8px",
//   },
//   limitIndicator: {
//     backgroundColor: "#fee2e2",
//     border: "1px solid #fecaca",
//     color: "#991b1b",
//     padding: "8px 12px",
//     borderRadius: "6px",
//     fontSize: "14px",
//     marginBottom: "8px",
//   },
//   compressingOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 10,
//     borderRadius: "12px",
//   },
//   compressingSpinner: {
//     width: "40px",
//     height: "40px",
//     border: "4px solid #f3f3f3",
//     borderTop: "4px solid #10b981",
//     borderRadius: "50%",
//     animation: "spin 1s linear infinite",
//     marginBottom: "10px",
//   },
//   compressingText: {
//     color: "#374151",
//     fontSize: "14px",
//     fontWeight: "500",
//   },
//   captureButton: {
//     width: "100%",
//     padding: "14px 0",
//     border: "none",
//     borderRadius: "10px",
//     fontSize: "16px",
//     fontWeight: "600",
//     color: "white",
//     cursor: "pointer",
//     transition: "all 0.2s",
//     marginBottom: "16px",
//     ":hover:not(:disabled)": {
//       opacity: 0.9,
//       transform: "translateY(-1px)",
//     },
//     ":disabled": {
//       cursor: "not-allowed",
//     },
//   },
//   offlineImagesContainer: {
//     marginTop: "20px",
//     paddingTop: "20px",
//     borderTop: "1px solid rgba(255, 255, 255, 0.3)",
//   },
//   offlineImagesGrid: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "8px",
//   },
//   offlineImageWrapper: {
//     position: "relative",
//     width: "60px",
//     height: "60px",
//     borderRadius: "8px",
//     overflow: "hidden",
//     border: "2px solid rgba(255, 255, 255, 0.5)",
//   },
//   offlineImage: {
//     width: "100%",
//     height: "100%",
//     objectFit: "cover",
//     backgroundColor: "#f3f4f6",
//   },
//   offlineImageInfo: {
//     position: "absolute",
//     top: "2px",
//     left: "2px",
//     display: "flex",
//     alignItems: "center",
//     gap: "4px",
//   },
//   imageIndex: {
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     color: "white",
//     fontSize: "10px",
//     padding: "2px 4px",
//     borderRadius: "4px",
//   },
//   uploadedBadge: {
//     backgroundColor: "#10b981",
//     color: "white",
//     fontSize: "10px",
//     width: "14px",
//     height: "14px",
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   uploadProgress: {
//     backgroundColor: "rgba(59, 130, 246, 0.9)",
//     color: "white",
//     fontSize: "8px",
//     padding: "2px 4px",
//     borderRadius: "4px",
//   },
//   removeImageButton: {
//     position: "absolute",
//     bottom: "2px",
//     right: "2px",
//     backgroundColor: "rgba(239, 68, 68, 0.9)",
//     color: "white",
//     border: "none",
//     borderRadius: "50%",
//     width: "18px",
//     height: "18px",
//     fontSize: "12px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     padding: 0,
//     ":hover": {
//       backgroundColor: "#ef4444",
//       transform: "scale(1.1)",
//     },
//   },
//   bottomSection: {
//     padding: "0 4px",
//   },
//   taskSummary: {
//     display: "flex",
//     justifyContent: "space-around",
//     backgroundColor: "#f9fafb",
//     borderRadius: "8px",
//     padding: "12px",
//     fontSize: "14px",
//     color: "#374151",
//     marginBottom: "8px",
//   },
//   summaryItem: {
//     fontWeight: "500",
//   },
//   offlineNotice: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: "12px",
//     padding: "8px",
//     backgroundColor: "#f3f4f6",
//     borderRadius: "6px",
//   },
// };

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../components/useNetworkStatus";
import axios from "axios";
import DisplayListSection from "../components/DisplayListSection";
import { toast } from "react-toastify";
import { store, persistor } from "../redux/store";
import useDailyISTCleanup from "../hooks/useDailyISTCleanup";

export default function TaskDetail() {
  
  // Get params first so they are available for useSelector
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
  // Get the current task from redux (offline/online) by ScheduleID (ID) and StoreID
  const task = useSelector((state) =>
    state.tasks.tasks.find(
      (t) =>
        String(t.ID) === String(ScheduleID) &&
        String(t.StoreID) === String(StoreID),
    ),
  );
 useDailyISTCleanup(store, persistor);
  console.log(task, "tasksss");
  const displays = task?.displays || [];
  console.log(DOWork, "DOWork");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("during");
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { isOnline } = useNetworkStatus();
  // TODO: Replace capturedImages logic with local state or context if needed

  // --- Images to Show Logic ---
  // Get offline images from Redux (if available)
 

  // For demo: show displays as images when online, offlineImages when offline
  let imagesToShow = [];
 
  // --- Images to Show Logic ---
  // Get offline images from Redux (if available)
  const offlineImages = useSelector(
    (state) => state.tasks?.offlineImages || [],
  );
  // Filter for current task and tab (if offlineImages exist)
  const currentOfflineImages = offlineImages.filter(
    (img) =>
      img.metadata?.taskId === ActivityID && img.metadata?.tab === activeTab,
  );

  // For demo: show displays as images when online, offlineImages when offline
  if (isOnline) {
    // Use displays for online images (customize as needed)
    imagesToShow = displays
      .map((d) => {
        if (activeTab === "during" && d.BeforeImageURL) {
          return { src: d.BeforeImageURL, uploaded: true };
        } else if (activeTab === "post" && d.AfterImageURL) {
          return { src: d.AfterImageURL, uploaded: true };
        }
        return null;
      })
      .filter(Boolean);
  } else {
    // Use offline images
    imagesToShow = currentOfflineImages?.map((img) => ({
      src: img.imageData,
      ...img,
    }));
  }

  const startBackCamera = async () => {
    try {
      let stream;
      // First try with exact constraint for environment (back camera)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (exactError) {
        // Fallback to regular environment constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }

      streamRef.current = stream;
      setHasCameraPermission(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Back camera error:", err);
      setHasCameraPermission(false);
      setIsCameraOpen(false);
      setCameraError("Failed to access back camera");

      // Try any camera as fallback
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = fallbackStream;
        setHasCameraPermission(true);
        setCameraError("Using fallback camera (back camera not available)");

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackError) {
        setCameraError("No camera available. Please check device permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      startBackCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOpen, ActivityID, StoreID]);

  // Example: Count images using displays array (customize as needed)
  const getTotalImagesCount = () => {
    if (!displays || displays.length === 0)
      return { during: 0, post: 0, total: 0 };
    // Example: count BeforeImageURL and AfterImageURL for each display
    let during = 0,
      post = 0;
    displays.forEach((d) => {
      if (d.BeforeImageURL) during++;
      if (d.AfterImageURL) post++;
    });
    return { during, post, total: during + post };
  };

  const base64ToBlob = (base64) => {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/jpeg" });
  };

  const uploadImageToAPI = async (imageData, stage, imageId) => {
    try {
      const blob = base64ToBlob(imageData);
      const file = new File([blob], `image_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("ScheduleID", ScheduleID);
      formData.append("DOWork", DOWork);
      formData.append("StoreID", StoreID);
      formData.append("ActivityID", ActivityID);
      formData.append("Stage", stage);
      formData.append(
        "DTOImage",
        new Date().toISOString().replace("T", " ").substring(0, 19),
      );
      formData.append("UserID", "1");
      formData.append("Image", file);

      const response = await axios.post(
        "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/QCImageUpload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress((prev) => ({
              ...prev,
              [imageId]: percentCompleted,
            }));
          },
        },
      );

      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[imageId];
        return newProgress;
      });

      return response.data;
    } catch (error) {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[imageId];
        return newProgress;
      });
      throw error;
    }
  };

  const auth = localStorage.getItem("auth");

  useEffect(() => {
    if (auth !== "true") {
      localStorage.removeItem("auth");
      localStorage.removeItem("id");
      navigate("/");
    }
  }, [auth]);

  const captureImage = async () => {
    const counts = getTotalImagesCount();

    if (activeTab === "during" && counts.during >= DURING_LIMIT) {
      alert(
        `Maximum ${DURING_LIMIT} images allowed for During Activity in this task`,
      );
      return;
    }

    if (activeTab === "post" && counts.post >= POST_LIMIT) {
      alert(
        `Maximum ${POST_LIMIT} images allowed for Post Activity in this task`,
      );
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("Camera not ready. Please try again.");
      return;
    }

    try {
      canvas.width = Math.min(video.videoWidth, 1920);
      canvas.height = Math.min(video.videoHeight, 1080);

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      ctx.restore();

      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      const imageId = `${StoreID}-${ActivityID}-${activeTab}-${Date.now()}`;

      setIsCompressing(true);

      const stage = activeTab === "during" ? "Before" : "After";

      if (isOnline) {
        setIsUploading(true);
        try {
          await uploadImageToAPI(imageData, stage, imageId);

          // Optimistically update display status in Redux so user can't capture again
          dispatch({
            type: "UPDATE_DISPLAY_STATUS",
            payload: {
              scheduleId: ScheduleID,
              displayId: ActivityID, // Assuming ActivityID is used as displayId here; adjust if needed
              stage: stage.toLowerCase(),
              imageUrl: imageData, // Use the local imageData as a placeholder; backend should return the real URL if needed
            },
          });
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          storeImageOffline(imageData, stage);
          // alert("Upload failed. Image saved for offline sync.");
        } finally {
          setIsUploading(false);
        }
      } else {
        storeImageOffline(imageData, stage);
        // alert("You are offline. Image saved locally and will sync when back online.");
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const storeImageOffline = (imageData, stage) => {
    const timestamp = new Date().toISOString();

    dispatch({
      type: "CAPTURE_IMAGE",
      payload: {
        userId: StoreID,
        taskId: ScheduleID, // Use ScheduleID for unique task
        imageData: imageData,
        tab: activeTab,
        timestamp: timestamp,
        stage: stage,
        scheduleId: ScheduleID,
        storeId: StoreID,
        activityId: ActivityID,
        DOWork: DOWork,
      },
    });
  };

  const handleClearAll = () => {
    const counts = getTotalImagesCount();
    if (counts.total === 0) {
      alert("No images to clear.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to clear all ${counts.total} images for this task?`,
      )
    ) {
      dispatch({
        type: "CLEAR_USER_TASK_IMAGES",
        payload: {
          userId: StoreID,
          taskId: ScheduleID, // Use ScheduleID for unique task
        },
      });
      alert("All images cleared.");
    }
  };

  const removeOfflineImage = (index) => {
    dispatch({
      type: "REMOVE_IMAGE",
      payload: {
        userId: StoreID,
        taskId: ScheduleID, // Use ScheduleID for unique task
        tab: activeTab,
        index: index,
      },
    });
  };

  if (!ActivityID) {
    return (
      <div style={styles.errorContainer}>
        <h2>Task Not Found</h2>
        <p>No task ID provided. Please go back to the task list.</p>
        <button style={styles.backButton} onClick={() => navigate("/tasks")}>
          Back to Tasks
        </button>
      </div>
    );
  }
  const counts = getTotalImagesCount();

  // Display list is now included in the tasks data from DailySchedule_Get
  // Find the current task from Redux and get its Displays
  const tasks = useSelector((state) => state.tasks.tasks);
  const currentTask = tasks.find(
    (task) =>
      String(task.ScheduleID) === String(ScheduleID) &&
      String(task.StoreID) === String(StoreID),
  );
  const displayList = currentTask?.displays || [];
  const loadingDisplayList = false;

  console.log(tasks, "tasks");

  return (
    <div style={styles.container}>
      {/* Header (like TaskList) */}
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
        displayList={displayList}
        loadingDisplayList={loadingDisplayList}
        DOWork={DOWork}
        SupplierID={SupplierID}
      />
      {/* Fallback message if no data available */}
      {!loadingDisplayList && (!displayList || displayList.length === 0) && (
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
  timeSection: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "white",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#374151",
    marginBottom: "20px",
  },
  container: {
    backgroundColor: "white",
    minHeight: "100vh",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#374151",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    textAlign: "center",
  },
  header: {
    position: "relative",
    display: "flex",
  },
  backButton: {
    height: "10px",
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 0",
    ":hover": {
      color: "#374151",
    },
    marginRight: "20px",
  },
  mainTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 4px 0",
    lineHeight: "1.3",
    textAlign: "center",
  },
  tabContainer: {
    display: "flex",
    backgroundColor: "#f3f4f6",
    padding: "4px",
    borderRadius: "10px",
    marginBottom: "16px",
    gap: "4px",
  },
  activeTab: {
    flex: 1,
    padding: "12px 0",
    backgroundColor: "#e9ac3d",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  activeTab1: {
    flex: 1,
    padding: "12px 0",
    backgroundColor: "#189918",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  inactiveTab: {
    flex: 1,
    padding: "12px 0",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  evidenceSection: {
    backgroundColor: "#e9ac3d",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    position: "relative",
  },
  evidenceSections: {
    backgroundColor: "#189918",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    position: "relative",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "white",
    margin: "0",
  },
  limitsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  limitItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "14px",
    color: "white",
  },
  limitLabel: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  limitCount: {
    color: "#d1fae5",
    fontWeight: "600",
  },
  limitReached: {
    color: "#fecaca",
    fontWeight: "600",
  },
  imagePreview: {
    backgroundColor: "#000",
    borderRadius: "8px",
    height: "250px",
    marginBottom: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    position: "relative",
  },
  cameraOffPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  cameraOffIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  cameraOffText: {
    fontSize: "14px",
    margin: 0,
  },
  statusContainer: {
    marginBottom: "16px",
    minHeight: "40px",
  },
  offlineIndicator: {
    backgroundColor: "#fef3c7",
    border: "1px solid #fde68a",
    color: "#92400e",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "8px",
  },
  uploadingIndicator: {
    backgroundColor: "#dbeafe",
    border: "1px solid #bfdbfe",
    color: "#1e40af",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "8px",
  },
  limitIndicator: {
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "8px",
  },
  compressingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderRadius: "12px",
  },
  compressingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
  compressingText: {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
  },
  captureButton: {
    width: "100%",
    padding: "14px 0",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "16px",
    ":hover:not(:disabled)": {
      opacity: 0.9,
      transform: "translateY(-1px)",
    },
    ":disabled": {
      cursor: "not-allowed",
    },
  },
  offlineImagesContainer: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
  },
  offlineImagesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  offlineImageWrapper: {
    position: "relative",
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid rgba(255, 255, 255, 0.5)",
  },
  offlineImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#f3f4f6",
  },
  offlineImageInfo: {
    position: "absolute",
    top: "2px",
    left: "2px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  imageIndex: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    fontSize: "10px",
    padding: "2px 4px",
    borderRadius: "4px",
  },
  uploadedBadge: {
    backgroundColor: "#10b981",
    color: "white",
    fontSize: "10px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadProgress: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    color: "white",
    fontSize: "8px",
    padding: "2px 4px",
    borderRadius: "4px",
  },
  removeImageButton: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    ":hover": {
      backgroundColor: "#ef4444",
      transform: "scale(1.1)",
    },
  },
  bottomSection: {
    padding: "0 4px",
  },
  taskSummary: {
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    color: "#374151",
    marginBottom: "8px",
  },
  summaryItem: {
    fontWeight: "500",
  },
  offlineNotice: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "12px",
    padding: "8px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
  },
};

// (If needed, export styles or any other required objects here)
