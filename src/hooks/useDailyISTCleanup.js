import { useEffect } from "react";
import localforage from "localforage";
import { reduxPersistStore } from "../redux/persistStorage";

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
      console.log("♻️ [Daily Cleanup] Starting...");

      try {
        // 1. Purge Redux Persist
        await persistor.purge();

        // 2. Clear Redux State in memory
        store.dispatch({ type: "RESET_STORE" });

        // 3. Clear our custom LocalForage instance for Redux Persist
        await reduxPersistStore.clear();

        // 4. Clear default LocalForage instance (if used elsewhere)
        await localforage.clear();

        // 5. Clear LocalStorage completely
        localStorage.clear();

        console.log("✅ [Daily Cleanup] Complete.");
      } catch (err) {
        console.error("❌ [Daily Cleanup] Failed:", err);
      }
    }

    function runCleanupIfDateChanged() {
      const stored = localStorage.getItem(CLEANUP_KEY);
      const today = getSaudiDateString();

      // If already cleaned today, do nothing.
      if (stored === today) return;

      // Otherwise, run cleanup
      cleanupData().then(() => {
        // After clearing everything (which wiped CLEANUP_KEY), re-set it for today.
        localStorage.setItem(CLEANUP_KEY, today);

        // Optional: reload the page to ensure fresh start
        window.location.reload();
      });
    }

    runCleanupIfDateChanged();
    const intervalId = setInterval(runCleanupIfDateChanged, 60 * 1000); // Check every minute
    return () => clearInterval(intervalId);
  }, [store, persistor]);
}
