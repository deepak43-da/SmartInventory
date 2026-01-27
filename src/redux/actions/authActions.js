// src/redux/actions/authActions.js
import axios from "axios";
import { fetchAllTaskData } from "./offlineActions";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGIN_OFFLINE = "LOGIN_OFFLINE";
export const LOGOUT = "LOGOUT";

// Main login action
export const loginUser = (credentials) => async (dispatch) => {
  try {
    console.log("Attempting login with:", credentials.username);
    
    // 1. Authenticate user
    const authResponse = await axios.post(
      "https://tamimi.impulseglobal.net/Report/RamadhanApp/API/Login.asmx/UserLogin",
      {
        UserName: credentials.username,
        Password: credentials.password,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    console.log("Login response:", authResponse.data);

    if (!authResponse.data.Success) {
      throw new Error(authResponse.data.Message || "Authentication failed");
    }

    const userData = authResponse.data;
    const userId = userData.ID;

    // 2. Fetch all user data (schedules, activities, displays)
    const allTaskData = await fetchAllTaskData(userId);

    // 3. Dispatch login success with all data
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        user: userData,
        userId,
        ...allTaskData,
        lastLogin: Date.now(),
        isOnline: true,
      },
    });

    // 4. Store login info for offline access
    localStorage.setItem("last_user_id", userId);
    localStorage.setItem("last_username", credentials.username);

    return {
      success: true,
      user: userData,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);

    // Try offline login
    const offlineResult = await attemptOfflineLogin(dispatch);
    if (offlineResult.success) {
      return {
        success: true,
        user: offlineResult.user,
        offline: true,
        message: "Using offline data. Some features may be limited.",
      };
    }

    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message || "Login failed",
    });

    throw error;
  }
};

// Attempt offline login
export const attemptOfflineLogin = () => async (dispatch) => {
  try {
    const userId = localStorage.getItem("last_user_id");
    const username = localStorage.getItem("last_username");

    if (!userId || !username) {
      throw new Error("No offline data available");
    }

    // Load offline data from storage
    const offlineData = await loadOfflineData(userId);
    if (!offlineData) {
      throw new Error("No offline data found");
    }

    // Check if data is stale (older than 24 hours)
    const isStale = Date.now() - (offlineData.lastFetched || 0) > 24 * 60 * 60 * 1000;
    
    if (isStale) {
      console.warn("Offline data is stale");
    }

    dispatch({
      type: LOGIN_OFFLINE,
      payload: {
        user: {
          ID: userId,
          UserName: username,
          Name: offlineData.userName || "Offline User",
        },
        userId,
        tasks: offlineData.tasks || [],
        activities: offlineData.activities || [],
        displays: offlineData.displays || [],
        lastFetched: offlineData.lastFetched,
        isOnline: false,
        isStale,
      },
    });

    return {
      success: true,
      user: {
        ID: userId,
        UserName: username,
      },
      offline: true,
    };
  } catch (error) {
    console.error("Offline login failed:", error);
    return { success: false, error: error.message };
  }
};

// Load offline data from storage
const loadOfflineData = async (userId) => {
  try {
    const data = JSON.parse(localStorage.getItem(`offline_data_${userId}`));
    return data;
  } catch (error) {
    console.error("Error loading offline data:", error);
    return null;
  }
};

// Logout action
export const logoutUser = () => (dispatch) => {
  // Clear sensitive data
  localStorage.removeItem("last_user_id");
  localStorage.removeItem("last_username");
  
  dispatch({ type: LOGOUT });
  
  // Optional: Clear all local storage except auth token if you want
  // Object.keys(localStorage).forEach(key => {
  //   if (key.startsWith('offline_data_')) {
  //     localStorage.removeItem(key);
  //   }
  // });
};

// Check if user is logged in (for app initialization)
export const checkAuthStatus = () => async (dispatch) => {
  const userId = localStorage.getItem("last_user_id");
  if (userId) {
    return await attemptOfflineLogin()(dispatch);
  }
  return { success: false };
};