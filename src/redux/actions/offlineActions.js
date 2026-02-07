// offlineActions.js
import axios from "axios";
import moment from "moment";

// Action Types
export const OFFLINE_ACTION_TYPES = {
  CAPTURE_IMAGE: "CAPTURE_IMAGE",
  UPDATE_DISPLAY: "UPDATE_DISPLAY",
  ADD_TO_SYNC_QUEUE: "ADD_TO_SYNC_QUEUE",
  SYNC_SUCCESS: "SYNC_SUCCESS",
  SYNC_FAILED: "SYNC_FAILED",
  SYNC_START: "SYNC_START",
  SYNC_COMPLETE: "SYNC_COMPLETE",
  SET_NETWORK_STATUS: "SET_NETWORK_STATUS",
  REMOVE_IMAGE: "REMOVE_IMAGE",
  CLEAR_USER_TASK_IMAGES: "CLEAR_USER_TASK_IMAGES",
  QUANTITY_SUBMIT: "QUANTITY_SUBMIT",
  UPDATE_DISPLAY_STATUS: "UPDATE_DISPLAY_STATUS",
  UPDATE_PRODUCT_FACING: "UPDATE_PRODUCT_FACING",
  UPDATE_DISPLAY_IMAGE: "UPDATE_DISPLAY_IMAGE",
};

// Helper function to get next midnight in IST
export const getNextISTMidnight = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNow = new Date(utcNow + istOffset);
  
  const next = new Date(istNow);
  next.setHours(0, 0, 1, 0);
  if (istNow >= next) {
    next.setDate(next.getDate() + 1);
  }
  
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

  if (
    tasks.lastFetched &&
    now - tasks.lastFetched < cacheDuration &&
    tasks.tasks.length > 0
  ) {
    if (navigator.onLine) {
      fetchTasksOnline(userId, dispatch).catch(console.error);
    }
    return;
  }

  if (navigator.onLine) {
    try {
      await fetchTasksOnline(userId, dispatch);
    } catch (error) {
      if (tasks.tasks.length > 0) {
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
    "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/DailySchedule_Get",
    { StoreID: userId },
    { headers: { "Content-Type": "application/json" } },
  );
  const response = scheduleRes.data;
  const activities = response.data || [];
  const displays = response.displaydata || [];

  const activityMap = {};
  activities.forEach((activity) => {
    const key = `${activity.DOWork}_${activity.ScheduleID}_${activity.StoreID}_${activity.SupplierID}`;
    activityMap[key] = { ...activity, displays: [] };
  });

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

let isSyncing = false;

export const syncQueue = () => async (dispatch, getState) => {
  const state = getState();
  const { queue, networkStatus } = state.tasks;

  if (networkStatus !== "online" || isSyncing || queue.length === 0) {
    return { synced: 0, failed: 0 };
  }

  const pendingItems = queue.filter(
    (item) => item.status === "pending" || item.status === "failed"
  ).filter(item => (item.retryCount || 0) < (item.maxRetries || 3));

  if (pendingItems.length === 0) return { synced: 0, failed: 0 };

  isSyncing = true;
  dispatch({ type: OFFLINE_ACTION_TYPES.SYNC_START });

  let synced = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      switch (item.type) {
        case "IMAGE_UPLOAD":
          await uploadImage(item.data);
          break;
        case "QUANTITY_SUBMIT":
          await submitQuantities(item.data);
          break;
        default:
          console.warn("Unknown queue item type:", item.type);
      }

      dispatch({
        type: OFFLINE_ACTION_TYPES.SYNC_SUCCESS,
        payload: item.id,
      });
      synced++;
    } catch (error) {
      console.error(`Sync failed for item ${item.id}:`, error);
      failed++;
      
      const newRetryCount = (item.retryCount || 0) + 1;
      dispatch({
        type: OFFLINE_ACTION_TYPES.SYNC_FAILED,
        payload: {
          id: item.id,
          retryCount: newRetryCount,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  isSyncing = false;
  dispatch({ type: OFFLINE_ACTION_TYPES.SYNC_COMPLETE });
  return { synced, failed };
};

async function uploadImage(data) {
  const { ID, DTOImage, UserID, Image } = data;
  
  const formData = new FormData();
  formData.append("ID", ID);
  formData.append("DTOImage", DTOImage);
  formData.append("UserID", UserID);
  
  let imageFile = Image;
  if (typeof Image === "string" && Image.startsWith("data:image")) {
    const arr = Image.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    imageFile = new Blob([u8arr], { type: mime });
  }
  
  formData.append("Image", imageFile);

  const response = await axios.post(
    "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkImageUpload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  
  if (!response || response.status !== 200) {
    throw new Error("Image upload failed");
  }
  return response.data;
}

async function submitQuantities(data) {
  const formData = new URLSearchParams();
  formData.append("jsonData", JSON.stringify(data));

  const response = await fetch(
    "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/ScheduleWorkInputUpload",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    }
  );

  if (!response.ok) {
    throw new Error("Quantity submission failed");
  }
  return response.text();
}

export const monitorNetworkStatus = () => (dispatch) => {
  const handleOnline = () => {
    dispatch({ type: OFFLINE_ACTION_TYPES.SET_NETWORK_STATUS, payload: "online" });
    dispatch(syncQueue());
  };

  const handleOffline = () => {
    dispatch({ type: OFFLINE_ACTION_TYPES.SET_NETWORK_STATUS, payload: "offline" });
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  dispatch({
    type: OFFLINE_ACTION_TYPES.SET_NETWORK_STATUS,
    payload: navigator.onLine ? "online" : "offline",
  });

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

export const captureImageWithOfflineSupport = (imageData, metadata) => async (dispatch, getState) => {
  const { networkStatus, queue } = getState().tasks;
  const { userId, displayId, imgId } = metadata;

  const isDuplicate = queue.some(
    (item) =>
      item.type === "IMAGE_UPLOAD" &&
      item.data?.ID === imgId
  );

  if (isDuplicate) {
    return { success: false, message: "Image already in sync queue" };
  }

  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  const uploadData = {
    ID: imgId,
    DTOImage: now,
    UserID: userId,
    Image: imageData,
  };

  dispatch({
    type: OFFLINE_ACTION_TYPES.ADD_TO_SYNC_QUEUE,
    payload: {
      type: "IMAGE_UPLOAD",
      data: uploadData,
      retryCount: 0,
      maxRetries: 3,
    },
  });

  dispatch({
    type: OFFLINE_ACTION_TYPES.UPDATE_DISPLAY_IMAGE,
    payload: {
      displayId: displayId,
      imageId: imgId,
      DTOImage: now,
      ImageURL: imageData.startsWith("data:") ? imageData : URL.createObjectURL(imageData),
    },
  });

  if (networkStatus === "online") {
    dispatch(syncQueue());
  }

  return { success: true };
};