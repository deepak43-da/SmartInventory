// // const initialState = {
// //   tasks: [], // Array of DailySchedule_Get items (with Displays)
// //   lastFetched: null,
// // };

// // export default function tasksReducer(state = initialState, action) {
// //   switch (action.type) {
// //     case "SET_TASKS":
// //       return {
// //         ...state,
// //         tasks: action.payload,
// //         lastFetched: Date.now(),
// //       };
// //     case "UPDATE_TASK":
// //       return {
// //         ...state,
// //         tasks: state.tasks.map((task) =>
// //           task.ID === action.payload.ID ? { ...task, ...action.payload } : task,
// //         ),
// //       };
// //     default:
// //       return state;
// //   }
// // }

// const initialState = {
//   tasks: [], // Array of DailySchedule_Get items (with Displays)
//   lastFetched: null,
//   queue: [], // Items pending sync
//   offlineImages: [], // Images captured offline
//   networkStatus: "online", // 'online' or 'offline'
//   syncInProgress: false,
//   lastSync: null,
// };

// export default function tasksReducer(state = initialState, action) {
//   switch (action.type) {
//     case "SET_TASKS":
//       return {
//         ...state,
//         tasks: Array.isArray(action.payload)
//           ? action.payload
//           : action.payload.tasks || [],
//         lastFetched: action.payload.lastFetched || Date.now(),
//         offline: action.payload.offline || false,
//       };

//     case "UPDATE_TASK":
//       return {
//         ...state,
//         tasks: state.tasks.map((task) =>
//           task.ID === action.payload.ID ? { ...task, ...action.payload } : task,
//         ),
//       };

//     case "CAPTURE_IMAGE":
//       return {
//         ...state,
//         offlineImages: [...state.offlineImages, action.payload],
//       };

//     case "UPDATE_DISPLAY_STATUS": {
//       // action.payload: { scheduleId, displayId, stage, imageUrl }
//       const { scheduleId, displayId, stage, imageUrl } = action.payload;
//       return {
//         ...state,
//         tasks: state.tasks.map((task) => {
//           if (task.ScheduleID !== scheduleId) return task;
//           return {
//             ...task,
//             displays: task.displays.map((display) => {
//               if (display.DisplayID !== displayId) return display;
//               let updated = { ...display };
//               if (stage.toLowerCase() === "before") {
//                 updated.BeforeImageURL = imageUrl;
//               }
//               if (stage.toLowerCase() === "after") {
//                 updated.AfterImageURL = imageUrl;
//               }
//               // If both images are present, mark as completed
//               if (updated.BeforeImageURL && updated.AfterImageURL) {
//                 updated.Completed = "Yes";
//               }
//               return updated;
//             }),
//           };
//         }),
//       };
//     }

//     case "ADD_TO_SYNC_QUEUE":
//       return {
//         ...state,
//         queue: [
//           ...state.queue,
//           {
//             ...action.payload,
//             id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//             timestamp: new Date().toISOString(),
//             status: "pending",
//           },
//         ],
//       };

//     case "SET_NETWORK_STATUS":
//       return {
//         ...state,
//         networkStatus: action.payload,
//       };

//     case "SYNC_SUCCESS":
//       return {
//         ...state,
//         queue: state.queue.filter((item) => item.id !== action.payload),
//         lastSync: Date.now(),
//       };

//     case "SYNC_FAILED":
//       return {
//         ...state,
//         queue: state.queue.map((item) =>
//           item.id === action.payload.id
//             ? { ...item, retryCount: action.payload.retryCount }
//             : item,
//         ),
//       };

//     case "CLEAR_USER_TASK_IMAGES":
//       return {
//         ...state,
//         offlineImages: state.offlineImages.filter(
//           (img) =>
//             !(
//               img.metadata?.userId === action.payload.userId &&
//               img.metadata?.taskId === action.payload.taskId
//             ),
//         ),
//         queue: state.queue.filter(
//           (item) =>
//             !(
//               item.data?.metadata?.userId === action.payload.userId &&
//               item.data?.metadata?.taskId === action.payload.taskId
//             ),
//         ),
//       };

//     case "REMOVE_IMAGE":
//       const { userId, taskId, tab, index } = action.payload;
//       return {
//         ...state,
//         offlineImages: state.offlineImages.filter((img, idx) => {
//           if (idx !== index) return true;
//           if (img.metadata?.userId !== userId) return true;
//           if (img.metadata?.taskId !== taskId) return true;
//           if (img.metadata?.tab !== tab) return true;
//           return false;
//         }),
//       };

//     default:
//       return state;
//   }
// }

// tasksReducer.js
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