import { useNetworkStatus } from "../../components/useNetworkStatus";
import axios from "axios";




// export const fetchTasks = (userId) => async (dispatch) => {
//   try {
//     // Fetch DailySchedule_Get (now includes activities and displays)
//     const scheduleRes = await axios.post(
//       "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/DailySchedule_Get",
//       { StoreID: userId },
//       { headers: { "Content-Type": "application/json" } },
//     );
//     const response = scheduleRes.data;
//     const activities = response.data || [];
//     const displays = response.displaydata || [];

//     // Map displays to activities
//     const activityMap = {};
//     activities.forEach((activity) => {
//       const key = `${activity.DOWork}_${activity.ScheduleID}_${activity.StoreID}_${activity.SupplierID}`;
//       activityMap[key] = {
//         ...activity,
//         displays: [],
//       };
//     });
//     displays.forEach((display) => {
//       const key = `${display.DOWork}_${display.ScheduleID}_${display.StoreID}_${display.SupplierID}`;
//       if (activityMap[key]) {
//         activityMap[key].displays.push(display);
//       }
//     });
//     const finalSchedules = Object.values(activityMap);
//     dispatch({ type: "SET_TASKS", payload: finalSchedules });
//   } catch (error) {
//     // Only clear tasks if online, otherwise preserve offline data
//     if (window.navigator.onLine) {
//       dispatch({ type: "SET_TASKS", payload: [] });
//     }
//     // else: do nothing, keep last good data
//   }
// };


export const fetchTasks = (userId) => async (dispatch) => {
  try {
    const res = await axios.post(
      "https://tamimi.impulseglobal.net/Report/ShareOfShelf/API/AppService.asmx/DailySchedule_Get",
      { StoreID: userId },
      { headers: { "Content-Type": "application/json" } }
    );

    const raw = res.data || {};

    // --- Read EXACT dummy / API structure ---
    const displays = raw.displays || raw.displaydata || [];
    const inputData = raw.inputData || [];
    const imageData = raw.imageData || [];

    // --- Helpers ---
    const keyOf = (o) =>
      `${o.ScheduleID}_${o.DisplayID}_${o.Version}`;

    const scheduleMap = {};
    const displayIndex = {};

    // --- 1️⃣ Build schedules & displays ---
    displays.forEach((d) => {
      if (!scheduleMap[d.ScheduleID]) {
        scheduleMap[d.ScheduleID] = {
          // ScheduleID: d.ScheduleID,
          StoreID: d.StoreID,
          displays: [],
        };
      }

      const display = {
        ScheduleID: d.ScheduleID,
        StoreID: d.StoreID,
        DisplayID: d.DisplayID,
        Version: d.Version,
        ImageURL: d.ImageURL,   // planogram image
        products: [],
        imageData: [],
      };

      scheduleMap[d.ScheduleID].displays.push(display);
      displayIndex[keyOf(d)] = display;
    });

    // --- 2️⃣ Products → from inputData ---
    inputData.forEach((row) => {
      const target = displayIndex[keyOf(row)];
      if (!target) return;

      // product rows have ArticleNo / UpcCode
      if (row.ArticleNo || row.UpcCode) {
        target.products.push(row);
      }
    });

    // --- 3️⃣ Images → from imageData ---
    imageData.forEach((img) => {
      const target = displayIndex[keyOf(img)];
      if (!target) return;

      target.imageData.push(img);
    });
    // --- Dispatch ---
    dispatch({

      type: "SET_TASKS",
      payload: Object.values(scheduleMap),
    });

  } catch (error) {
    if (window.navigator.onLine) {
      dispatch({ type: "SET_TASKS", payload: [] });
    }
  }
};
