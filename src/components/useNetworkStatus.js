// // hooks/useNetworkStatus.js
// import { useEffect, useState } from 'react';

// export function useNetworkStatus() {
//   const [isOnline, setIsOnline] = useState(navigator.onLine);

//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   return { isOnline };
// }

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { OFFLINE_ACTION_TYPES } from "../redux/actions/offlineActions";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dispatch({
        type: OFFLINE_ACTION_TYPES.SET_NETWORK_STATUS,
        payload: "online",
      });

      // Trigger sync when coming back online
      setTimeout(() => {
        // Import and dispatch syncQueue action
        import("../redux/actions/offlineActions").then(({ syncQueue }) => {
          syncQueue(dispatch, () => window.store.getState());
        });
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      dispatch({
        type: OFFLINE_ACTION_TYPES.SET_NETWORK_STATUS,
        payload: "offline",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial dispatch
    dispatch({
      type: OFFLINE_ACTION_TYPES.SET_NETWORK_STATUS,
      payload: navigator.onLine ? "online" : "offline",
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch]);

  return { isOnline };
};
