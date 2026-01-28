
const initialState = {
  tasks: [],
  lastFetched: null,
  queue: [],
  offlineImages: [],
  networkStatus: "online",
  syncInProgress: false,
  lastSync: null,
};

export default function tasksReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_TASKS":
      return {
        ...state,
        tasks: Array.isArray(action.payload)
          ? action.payload
          : action.payload.tasks || [],
        lastFetched: action.payload.lastFetched || Date.now(),
        offline: action.payload.offline || false,
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.ID === action.payload.ID ? { ...task, ...action.payload } : task,
        ),
      };

    case "CAPTURE_IMAGE":
      return {
        ...state,
        offlineImages: [...state.offlineImages, action.payload],
      };

    case "UPDATE_DISPLAY_STATUS": {
      const { scheduleId, displayId, stage, imageUrl, localOnly } = action.payload;
      
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.ScheduleID !== scheduleId) return task;
          return {
            ...task,
            displays: task.displays.map((display) => {
              if (display.DisplayID !== displayId) return display;
              let updated = { ...display };
              
              if (stage.toLowerCase() === "before") {
                updated.BeforeImageURL = imageUrl;
                if (localOnly) updated.BeforeImageLocal = true;
              }
              if (stage.toLowerCase() === "after") {
                updated.AfterImageURL = imageUrl;
                if (localOnly) updated.AfterImageLocal = true;
              }
              
              // Mark as completed only if both images exist (either local or remote)
              const hasBefore = updated.BeforeImageURL;
              const hasAfter = updated.AfterImageURL;
              if (hasBefore && hasAfter) {
                updated.Completed = "Yes";
              }
              
              return updated;
            }),
          };
        }),
      };
    }

    case "ADD_TO_SYNC_QUEUE":
      return {
        ...state,
        queue: [
          ...state.queue,
          {
            ...action.payload,
            id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            status: "pending",
          },
        ],
      };

    case "SET_NETWORK_STATUS":
      return {
        ...state,
        networkStatus: action.payload,
        syncInProgress: action.payload === "online",
      };

    case "SYNC_SUCCESS":
      return {
        ...state,
        queue: state.queue.filter((item) => item.id !== action.payload),
        lastSync: Date.now(),
      };

    case "SYNC_FAILED":
      return {
        ...state,
        queue: state.queue.map((item) =>
          item.id === action.payload.id
            ? { 
                ...item, 
                retryCount: action.payload.retryCount,
                lastError: action.payload.error,
                lastAttempt: action.payload.timestamp,
                status: action.payload.retryCount >= 3 ? "failed" : "pending"
              }
            : item,
        ),
      };

    case "REMOVE_IMAGE":
      return {
        ...state,
        offlineImages: state.offlineImages.filter(img => img.id !== action.payload),
      };

    case "CLEAR_USER_TASK_IMAGES":
      return {
        ...state,
        offlineImages: state.offlineImages.filter(
          (img) =>
            !(
              img.metadata?.userId === action.payload.userId &&
              img.metadata?.taskId === action.payload.taskId
            ),
        ),
        queue: state.queue.filter(
          (item) =>
            !(
              item.type === "IMAGE_UPLOAD" &&
              item.data?.metadata?.userId === action.payload.userId &&
              item.data?.metadata?.taskId === action.payload.taskId
            ),
        ),
      };
      // Add this case to your existing reducer
case "ADD_TO_SYNC_QUEUE":
  return {
    ...state,
    queue: [
      ...state.queue,
      {
        ...action.payload,
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        status: "pending",
      },
    ],
  };

    case "CLEANUP_DATA":
      return {
        ...state,
        offlineImages: action.payload.offlineImages,
        queue: action.payload.queue,
      };

    default:
      return state;
  }
}