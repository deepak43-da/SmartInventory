import { useEffect } from "react";

const CLEANUP_KEY = "last_cleanup_date";
const RIYADH = "Asia/Riyadh";

/**
 * Returns today's date in Asia/Riyadh as YYYY-MM-DD (no manual UTC math).
 */
function getSaudiDateString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: RIYADH });
}

/**
 * Daily cleanup hook: when the calendar date in Saudi (Asia/Riyadh) changes,
 * clears localStorage data and localforage. Fully offline; no API calls.
 *
 * @param {object} store - Redux store
 * @param {object} persistor - Redux persistor
 */
export default function useDailyISTCleanup(store, persistor) {
  useEffect(() => {
    async function cleanupData() {
      await persistor.purge();
      store.dispatch({ type: "RESET_STORE" });
      localStorage.removeItem("persist:root");
      localStorage.removeItem("id");
      localStorage.removeItem("auth");
      localStorage.removeItem("StoreID");
      localStorage.removeItem("StoreName");
      localStorage.removeItem("Type");
      localStorage.removeItem("UserID");
      localStorage.removeItem("maindata");

   


      if (window.localforage) {
        try {
         
          await window.localforage.clear();
        } catch (_) {}
      }
    }

    function runCleanupIfDateChanged() {
      const stored = localStorage.getItem(CLEANUP_KEY);
      const today = getSaudiDateString();
      if (stored === today) return;

      cleanupData().then(() => {
      
        localStorage.setItem(CLEANUP_KEY, today);
      });
    }

    runCleanupIfDateChanged();
    const intervalId = setInterval(runCleanupIfDateChanged, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [store, persistor]);
}
