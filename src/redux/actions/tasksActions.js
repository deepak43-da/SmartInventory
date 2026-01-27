import { useNetworkStatus } from "../../components/useNetworkStatus";
import axios from "axios";




export const fetchTasks = (userId) => async (dispatch) => {
  try {
    // Fetch DailySchedule_Get (now includes activities and displays)
    const scheduleRes = await axios.post(
      "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Schedules.asmx/DailySchedule_Get",
      { StoreID: userId },
      { headers: { "Content-Type": "application/json" } },
    );
    const response = scheduleRes.data;
    const activities = response.data || [];
    const displays = response.displaydata || [];

    // Map displays to activities
    const activityMap = {};
    activities.forEach((activity) => {
      const key = `${activity.DOWork}_${activity.ScheduleID}_${activity.StoreID}_${activity.SupplierID}`;
      activityMap[key] = {
        ...activity,
        displays: [],
      };
    });
    displays.forEach((display) => {
      const key = `${display.DOWork}_${display.ScheduleID}_${display.StoreID}_${display.SupplierID}`;
      if (activityMap[key]) {
        activityMap[key].displays.push(display);
      }
    });
    const finalSchedules = Object.values(activityMap);
    dispatch({ type: "SET_TASKS", payload: finalSchedules });
  } catch (error) {
    // Only clear tasks if online, otherwise preserve offline data
    if (window.navigator.onLine) {
      dispatch({ type: "SET_TASKS", payload: [] });
    }
    // else: do nothing, keep last good data
  }
};


