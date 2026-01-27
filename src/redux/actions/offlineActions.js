// import axios from "axios";

// // Action Types
// export const OFFLINE_ACTION_TYPES = {
//   CAPTURE_IMAGE: "CAPTURE_IMAGE",
//   UPDATE_DISPLAY: "UPDATE_DISPLAY",
//   ADD_TO_SYNC_QUEUE: "ADD_TO_SYNC_QUEUE",
//   SYNC_SUCCESS: "SYNC_SUCCESS",
//   SYNC_FAILED: "SYNC_FAILED",
//   SYNC_QUEUE: "SYNC_QUEUE",
//   SET_NETWORK_STATUS: "SET_NETWORK_STATUS",
// };

// // Enhanced fetchTasks with offline-first approach
// export const fetchTasks = (userId) => async (dispatch, getState) => {
//   const { tasks } = getState();
//   const now = Date.now();
//   const cacheDuration = 5 * 60 * 1000; // 5 minutes cache

//   // Check if we have cached data and it's not too old
//   if (
//     tasks.lastFetched &&
//     now - tasks.lastFetched < cacheDuration &&
//     tasks.tasks.length > 0
//   ) {
//     // Use cached data, but also fetch in background if online
//     if (navigator.onLine) {
//       // Background refresh
//       fetchTasksOnline(userId, dispatch).catch(console.error);
//     }
//     return;
//   }

//   if (navigator.onLine) {
//     try {
//       await fetchTasksOnline(userId, dispatch);
//     } catch (error) {
//       // If online fetch fails but we have offline data, use it
//       if (tasks.tasks.length > 0) {
//         console.log("Using offline data due to network error");
//         dispatch({
//           type: "SET_TASKS",
//           payload: {
//             tasks: tasks.tasks,
//             lastFetched: tasks.lastFetched,
//             offline: true,
//           },
//         });
//       } else {
//         dispatch({ type: "SET_TASKS", payload: [] });
//       }
//     }
//   } else {
//     // Use offline data
//     if (tasks.tasks.length > 0) {
//       dispatch({
//         type: "SET_TASKS",
//         payload: {
//           tasks: tasks.tasks,
//           lastFetched: tasks.lastFetched,
//           offline: true,
//         },
//       });
//     }
//   }
// };

// async function fetchTasksOnline(userId, dispatch) {
//   // Fetch DailySchedule_Get
//   const scheduleRes = await axios.post(
//     "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/DailySchedule_Get",
//     { StoreID: userId },
//     { headers: { "Content-Type": "application/json" } },
//   );
//   const response = scheduleRes.data;
//   const activities = response.data || [];
//   const displays = response.displaydata || [];

//   // Create activity lookup map
//   const activityMap = {};
//   activities.forEach((activity) => {
//     const key = `${activity.DOWork}_${activity.ScheduleID}_${activity.StoreID}_${activity.SupplierID}`;
//     activityMap[key] = {
//       ...activity,
//       displays: [],
//     };
//   });

//   // Attach displays
//   displays.forEach((display) => {
//     const key = `${display.DOWork}_${display.ScheduleID}_${display.StoreID}_${display.SupplierID}`;
//     if (activityMap[key]) {
//       activityMap[key].displays.push(display);
//     }
//   });

//   // Final result
//   const finalSchedules = Object.values(activityMap);

//   dispatch({
//     type: "SET_TASKS",
//     payload: {
//       tasks: finalSchedules,
//       lastFetched: Date.now(),
//       offline: false,
//     },
//   });
// }

// // Capture image with offline support
// export const captureImageWithOfflineSupport =
//   (imageData, metadata) => async (dispatch, getState) => {
//     const { networkStatus, offlineImages = [] } = getState().tasks;

//     // Prevent duplicate: check if an image for this userId, taskId, tab, and type exists
//     const isDuplicate = offlineImages.some(
//       (img) =>
//         img.metadata?.userId === metadata.userId &&
//         img.metadata?.taskId === metadata.taskId &&
//         img.metadata?.tab === metadata.tab &&
//         img.metadata?.type === metadata.type,
//     );
//     if (isDuplicate) {
//       // Optionally, show a toast or return early
//       return;
//     }

//     const imageRecord = {
//       id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       imageData,
//       metadata,
//       timestamp: new Date().toISOString(),
//       status: networkStatus === "online" ? "pending" : "offline",
//     };

//     // Store immediately in Redux
//     dispatch({
//       type: "CAPTURE_IMAGE",
//       payload: imageRecord,
//     });

//     // Add to sync queue
//     dispatch({
//       type: "ADD_TO_SYNC_QUEUE",
//       payload: {
//         type: "IMAGE_UPLOAD",
//         data: imageRecord,
//         retryCount: 0,
//       },
//     });

//     // If online, try to sync immediately
//     if (networkStatus === "online") {
//       await syncQueue(dispatch, getState);
//     }
//   };

// // Sync queue function
// export const syncQueue = async (dispatch, getState) => {
//   const { queue, offlineImages = [], networkStatus } = getState().tasks;

//   // If online, try to upload all offlineImages
//   if (networkStatus === "online" && offlineImages.length > 0) {
//     for (const img of offlineImages) {
//       try {
//         await uploadImage(img);
//         // Remove from offlineImages after successful upload
//         dispatch({
//           type: "REMOVE_IMAGE",
//           payload: {
//             userId: img.metadata?.userId,
//             taskId: img.metadata?.taskId,
//             tab: img.metadata?.tab,
//             index: offlineImages.findIndex((i) => i.id === img.id),
//           },
//         });
//       } catch (error) {
//         // Optionally handle upload error
//         console.error("Failed to upload offline image", img, error);
//       }
//     }
//   }

//   for (const item of queue.filter((q) => q.status === "pending")) {
//     try {
//       await processQueueItem(item, dispatch);
//       dispatch({
//         type: "SYNC_SUCCESS",
//         payload: item.id,
//       });
//     } catch (error) {
//       console.error("Sync failed for item:", item.id, error);
//       dispatch({
//         type: "SYNC_FAILED",
//         payload: {
//           id: item.id,
//           retryCount: (item.retryCount || 0) + 1,
//         },
//       });
//     }
//   }
// };

// async function processQueueItem(item, dispatch) {
//   switch (item.type) {
//     case "IMAGE_UPLOAD":
//       await uploadImage(item.data);
//       break;
//     case "DISPLAY_UPDATE":
//       await updateDisplay(item.data);
//       break;
//     default:
//       console.warn("Unknown queue item type:", item.type);
//   }
// }

// // Upload image utility for offline sync
// async function uploadImage(img) {
//   // img: { imageData, metadata, ... }
//   const { imageData, metadata } = img;
//   const formData = new FormData();
//   formData.append("ScheduleID", metadata.scheduleId || metadata.taskId);
//   formData.append("DOWork", metadata.DOWork || "");
//   formData.append("StoreID", metadata.storeId || metadata.userId);
//   formData.append(
//     "DisplayID",
//     metadata.displayId || metadata.activityId || metadata.taskId,
//   );
//   formData.append(
//     "Stage",
//     metadata.stage
//       ? metadata.stage.charAt(0).toUpperCase() +
//           metadata.stage.slice(1).toLowerCase()
//       : "Before",
//   );
//   formData.append(
//     "DTOImage",
//     metadata.dtoImage ||
//       new Date().toISOString().replace("T", " ").substring(0, 19),
//   );
//   formData.append("UserID", metadata.userId || "1");

//   // Convert base64 to Blob if needed
//   let imageFile = imageData;
//   if (typeof imageData === "string" && imageData.startsWith("data:image")) {
//     const arr = imageData.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//       u8arr[n] = bstr.charCodeAt(n);
//     }
//     imageFile = new File([u8arr], `image_${Date.now()}.jpg`, {
//       type: mime,
//     });
//   }
//   formData.append("Image", imageFile);

//   // Use the same endpoint as online
//   const response = await axios.post(
//     "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/ScheduleWorkImageUpload",
//     formData,
//     {
//       headers: { "Content-Type": "multipart/form-data" },
//     },
//   );
//   if (!response || response.status !== 200) {
//     throw new Error("Image upload failed");
//   }
//   return response.data;
// }


// offlineActions.js
import axios from "axios";

// Action Types
export const OFFLINE_ACTION_TYPES = {
  CAPTURE_IMAGE: "CAPTURE_IMAGE",
  UPDATE_DISPLAY: "UPDATE_DISPLAY",
  ADD_TO_SYNC_QUEUE: "ADD_TO_SYNC_QUEUE",
  SYNC_SUCCESS: "SYNC_SUCCESS",
  SYNC_FAILED: "SYNC_FAILED",
  SET_NETWORK_STATUS: "SET_NETWORK_STATUS",
  REMOVE_IMAGE: "REMOVE_IMAGE",
  CLEAR_USER_TASK_IMAGES: "CLEAR_USER_TASK_IMAGES",
};

// Helper function to get next midnight in IST
export const getNextISTMidnight = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNow = new Date(utcNow + istOffset);
  
  // Set to next day 00:00:01 IST
  const next = new Date(istNow);
  next.setHours(0, 0, 1, 0);
  if (istNow >= next) {
    next.setDate(next.getDate() + 1);
  }
  
  // Convert back to local time
  const localNext = new Date(
    next.getTime() - istOffset - next.getTimezoneOffset() * 60000,
  );
  return localNext;
};

// Enhanced fetchTasks with offline-first approach
export const fetchTasks = (userId) => async (dispatch, getState) => {
  const { tasks } = getState();
  const now = Date.now();
  const cacheDuration = 5 * 60 * 1000; // 5 minutes cache

  // Check if we have cached data and it's not too old
  if (
    tasks.lastFetched &&
    now - tasks.lastFetched < cacheDuration &&
    tasks.tasks.length > 0
  ) {
    // Use cached data, but also fetch in background if online
    if (navigator.onLine) {
      // Background refresh
      fetchTasksOnline(userId, dispatch).catch(console.error);
    }
    return;
  }

  if (navigator.onLine) {
    try {
      await fetchTasksOnline(userId, dispatch);
    } catch (error) {
      // If online fetch fails but we have offline data, use it
      if (tasks.tasks.length > 0) {
        console.log("Using offline data due to network error");
        dispatch({
          type: "SET_TASKS",
          payload: {
            tasks: tasks.tasks,
            lastFetched: tasks.lastFetched,
            offline: true,
          },
        });
      } else {
        dispatch({ type: "SET_TASKS", payload: [] });
      }
    }
  } else {
    // Use offline data
    if (tasks.tasks.length > 0) {
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks: tasks.tasks,
          lastFetched: tasks.lastFetched,
          offline: true,
        },
      });
    }
  }
};

async function fetchTasksOnline(userId, dispatch) {
  const scheduleRes = await axios.post(
    "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/DailySchedule_Get",
    { StoreID: userId },
    { headers: { "Content-Type": "application/json" } },
  );
  const response = scheduleRes.data;
  const activities = response.data || [];
  const displays = response.displaydata || [];

  // Create activity lookup map
  const activityMap = {};
  activities.forEach((activity) => {
    const key = `${activity.DOWork}_${activity.ScheduleID}_${activity.StoreID}_${activity.SupplierID}`;
    activityMap[key] = {
      ...activity,
      displays: [],
    };
  });

  // Attach displays
  displays.forEach((display) => {
    const key = `${display.DOWork}_${display.ScheduleID}_${display.StoreID}_${display.SupplierID}`;
    if (activityMap[key]) {
      activityMap[key].displays.push(display);
    }
  });

  const finalSchedules = Object.values(activityMap);

  dispatch({
    type: "SET_TASKS",
    payload: {
      tasks: finalSchedules,
      lastFetched: Date.now(),
      offline: false,
    },
  });
}

// Enhanced capture image with better offline handling
export const captureImageWithOfflineSupport =
  (imageData, metadata) => async (dispatch, getState) => {
    const { networkStatus, offlineImages = [] } = getState().tasks;
    const { userId, taskId, tab, type, displayId, stage } = metadata;

    // Check for duplicates more precisely
    const isDuplicate = offlineImages.some(
      (img) =>
        img.metadata?.userId === userId &&
        img.metadata?.taskId === taskId &&
        img.metadata?.displayId === displayId &&
        img.metadata?.stage === stage
    );
    
    // Also check in sync queue
    const { queue } = getState().tasks;
    const queueDuplicate = queue.some(
      (item) =>
        item.type === "IMAGE_UPLOAD" &&
        item.data?.metadata?.userId === userId &&
        item.data?.metadata?.taskId === taskId &&
        item.data?.metadata?.displayId === displayId &&
        item.data?.metadata?.stage === stage
    );

    if (isDuplicate || queueDuplicate) {
      console.warn("Duplicate image capture detected, skipping");
      return { success: false, message: "Image already captured" };
    }

    const imageRecord = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageData,
      metadata,
      timestamp: new Date().toISOString(),
      status: networkStatus === "online" ? "pending" : "offline",
    };

    // Store immediately in Redux
    dispatch({
      type: "CAPTURE_IMAGE",
      payload: imageRecord,
    });

    // Add to sync queue
    dispatch({
      type: "ADD_TO_SYNC_QUEUE",
      payload: {
        type: "IMAGE_UPLOAD",
        data: imageRecord,
        retryCount: 0,
        maxRetries: 3,
      },
    });

    // Update display status locally
    dispatch({
      type: "UPDATE_DISPLAY_STATUS",
      payload: {
        scheduleId: metadata.scheduleId || metadata.taskId,
        displayId: metadata.displayId,
        stage: metadata.stage,
        imageUrl: imageData, // Use base64 as preview
        localOnly: true,
      },
    });

    // If online, try to sync immediately
    if (networkStatus === "online") {
      await dispatch(syncQueue());
    }

    return { success: true, data: imageRecord };
  };

// Enhanced sync queue with retry logic
export const syncQueue = () => async (dispatch, getState) => {
  const { queue, networkStatus } = getState().tasks;

  if (networkStatus !== "online") {
    return { synced: 0, failed: 0 };
  }

  const pendingItems = queue.filter(
    (item) => item.status === "pending" && (item.retryCount || 0) < (item.maxRetries || 3)
  );

  let synced = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      switch (item.type) {
        case "IMAGE_UPLOAD":
          await uploadImage(item.data);
          break;
        case "DISPLAY_UPDATE":
          await updateDisplay(item.data);
          break;
        default:
          console.warn("Unknown queue item type:", item.type);
      }

      dispatch({
        type: "SYNC_SUCCESS",
        payload: item.id,
      });
      synced++;
    } catch (error) {
      console.error("Sync failed for item:", item.id, error);
      
      const newRetryCount = (item.retryCount || 0) + 1;
      
      if (newRetryCount >= (item.maxRetries || 3)) {
        // Max retries exceeded, mark as failed
        dispatch({
          type: "SYNC_FAILED",
          payload: {
            id: item.id,
            retryCount: newRetryCount,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        // Schedule retry with exponential backoff
        setTimeout(() => {
          dispatch(syncQueue());
        }, Math.pow(2, newRetryCount) * 1000); // 2s, 4s, 8s...
        
        dispatch({
          type: "SYNC_FAILED",
          payload: {
            id: item.id,
            retryCount: newRetryCount,
          },
        });
      }
      failed++;
    }
  }

  return { synced, failed };
};

// Network status monitoring
export const monitorNetworkStatus = () => (dispatch) => {
  const handleOnline = () => {
    dispatch({
      type: "SET_NETWORK_STATUS",
      payload: "online",
    });
    // Trigger sync when coming online
    dispatch(syncQueue());
  };

  const handleOffline = () => {
    dispatch({
      type: "SET_NETWORK_STATUS",
      payload: "offline",
    });
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initial status
  dispatch({
    type: "SET_NETWORK_STATUS",
    payload: navigator.onLine ? "online" : "offline",
  });

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

// Clean up old data at midnight
export const cleanupOldData = () => (dispatch, getState) => {
  const { offlineImages, queue } = getState().tasks;
  const now = new Date();
  const midnight = getNextISTMidnight();

  // Remove images older than 7 days from offline storage
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const filteredImages = offlineImages.filter(img => {
    const imgDate = new Date(img.timestamp);
    return imgDate > sevenDaysAgo;
  });

  // Remove failed sync items older than 1 day
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const filteredQueue = queue.filter(item => {
    if (item.status === "failed") {
      const itemDate = new Date(item.timestamp);
      return itemDate > oneDayAgo;
    }
    return true;
  });

  if (filteredImages.length !== offlineImages.length || filteredQueue.length !== queue.length) {
    dispatch({
      type: "CLEANUP_DATA",
      payload: {
        offlineImages: filteredImages,
        queue: filteredQueue,
      },
    });
  }
};

// Upload image utility
async function uploadImage(img) {
  const { imageData, metadata } = img;
  const formData = new FormData();
  
  formData.append("ScheduleID", metadata.scheduleId || metadata.taskId);
  formData.append("DOWork", metadata.DOWork || "");
  formData.append("StoreID", metadata.storeId || metadata.userId);
  formData.append("DisplayID", metadata.displayId);
  formData.append(
    "Stage",
    metadata.stage
      ? metadata.stage.charAt(0).toUpperCase() +
          metadata.stage.slice(1).toLowerCase()
      : "Before",
  );
  formData.append(
    "DTOImage",
    metadata.dtoImage ||
      new Date().toISOString().replace("T", " ").substring(0, 19),
  );
  formData.append("UserID", metadata.userId || "1");

  // Convert base64 to Blob
  let imageFile = imageData;
  if (typeof imageData === "string" && imageData.startsWith("data:image")) {
    const arr = imageData.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    imageFile = new File([u8arr], `image_${Date.now()}.jpg`, {
      type: mime,
    });
  }
  formData.append("Image", imageFile);

  const response = await axios.post(
    "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/ScheduleWorkImageUpload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  
  if (!response || response.status !== 200) {
    throw new Error("Image upload failed");
  }
  
  return response.data;
}

async function updateDisplay(data) {
  // Implementation for display updates
  // Add your API call here
}