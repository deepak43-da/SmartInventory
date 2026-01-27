import AppRoutes from "./routes/AppRoutes";
import ToasterProvider from "./ToasterProvider";

import React from "react";
import { store, persistor } from "./redux/store";
import useDailyISTCleanup from "./hooks/useDailyISTCleanup";

export default function App() {
  useDailyISTCleanup(store, persistor);

  // Make store available globally for syncQueue function
  window.store = store;

  // Initialize offline sync
  store.dispatch({
    type: "SET_NETWORK_STATUS",
    payload: navigator.onLine ? "online" : "offline",
  });

  // Periodically sync when online
  setInterval(() => {
    if (navigator.onLine) {
      import("./redux/actions/offlineActions").then(({ syncQueue }) => {
        syncQueue(store.dispatch, () => store.getState());
      });
    }
  }, 30000); // Sync every 30 seconds when online




  return (
    <>
      <ToasterProvider />
      <AppRoutes />
    </>
  );
}
