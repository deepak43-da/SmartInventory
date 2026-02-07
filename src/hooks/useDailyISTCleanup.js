// import { useEffect } from "react";

// /**
//  * Hook to schedule daily cleanup of IndexedDB, localStorage, and Redux store at 00:00:01 IST.
//  * @param {object} store - Redux store instance
//  * @param {object} persistor - Redux persistor instance
//  */
// export default function useDailyISTCleanup(store, persistor) {
//   useEffect(() => {
//     function getISTDateString(date = new Date()) {
//       // Returns YYYY-MM-DD for IST
//       const istOffset = 5.5 * 60 * 60 * 1000;
//       const utc = date.getTime() + date.getTimezoneOffset() * 60000;
//       const ist = new Date(utc + istOffset);
//       return ist.toISOString().slice(0, 10); // 'YYYY-MM-DD'
//     }

//     async function cleanupData() {
//       // Clear Redux, localStorage, and localForage
//       await persistor.purge();
//       store.dispatch({ type: "RESET_STORE" });
//       localStorage.removeItem("auth");
//       localStorage.removeItem("id");
//       localStorage.removeItem("maindata");
//       // Clear localForage (if used)
//       if (window.localforage) {
//         try {
//           await window.localforage.clear();
//         } catch (e) {}
//       }
//     }

//     // On mount, check if IST date has changed since last cleanup
//     (async () => {
//       const lastCleanupDate = localStorage.getItem("lastCleanupISTDate");
//       const todayIST = getISTDateString();
//       if (lastCleanupDate !== todayIST) {
//         // Send message to service worker to cleanup caches
//         if (navigator.serviceWorker && navigator.serviceWorker.controller) {
//           navigator.serviceWorker.controller.postMessage({
//             type: "CLEANUP_ON_DATE_CHANGE",
//           });
//           // Listen for response from service worker
//           navigator.serviceWorker.addEventListener(
//             "message",
//             async (event) => {
//               if (event.data && event.data.type === "CLEANUP_DONE") {
//                 await cleanupData();
//                 localStorage.setItem("lastCleanupISTDate", todayIST);
//               }
//             },
//             { once: true },
//           );
//         } else {
//           // Fallback: cleanup directly if no service worker
//           await cleanupData();
//           localStorage.setItem("lastCleanupISTDate", todayIST);
//         }
//       }
//     })();

//     // Set interval to check every minute if IST date has changed
//     const intervalId = setInterval(async () => {
//       const lastCleanupDate = localStorage.getItem("lastCleanupISTDate");
//       const todayIST = getISTDateString();
//       if (lastCleanupDate !== todayIST) {
//         await cleanupData();
//         localStorage.setItem("lastCleanupISTDate", todayIST);
//       }
//     }, 60 * 1000); // check every minute

//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [store, persistor]);
// }


import { useEffect } from "react";

/**
 * Hook to schedule daily cleanup of IndexedDB, localStorage, and Redux store
 * based on Saudi time (Asia/Riyadh).
 */
export default function useDailySaudiCleanup(store, persistor) {
  useEffect(() => {
    function getSaudiDateString() {
      return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Riyadh",
      }); // YYYY-MM-DD
    }

    async function cleanupData() {
      await persistor.purge();
      store.dispatch({ type: "RESET_STORE" });

      localStorage.removeItem("auth");
      localStorage.removeItem("id");
      localStorage.removeItem("maindata");

      if (window.localforage) {
        try {
          await window.localforage.clear();
        } catch (e) {}
      }
    }

    // On mount check
    (async () => {
      const lastCleanupDate = localStorage.getItem("lastCleanupSaudiDate");
      const todaySaudi = getSaudiDateString();

      if (lastCleanupDate !== todaySaudi) {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "CLEANUP_ON_DATE_CHANGE",
          });

          navigator.serviceWorker.addEventListener(
            "message",
            async (event) => {
              if (event.data && event.data.type === "CLEANUP_DONE") {
                await cleanupData();
                localStorage.setItem("lastCleanupSaudiDate", todaySaudi);
              }
            },
            { once: true }
          );
        } else {
          await cleanupData();
          localStorage.setItem("lastCleanupSaudiDate", todaySaudi);
        }
      }
    })();

    // Check every minute for Saudi date change
    const intervalId = setInterval(async () => {
      const lastCleanupDate = localStorage.getItem("lastCleanupSaudiDate");
      const todaySaudi = getSaudiDateString();

      if (lastCleanupDate !== todaySaudi) {
        await cleanupData();
        localStorage.setItem("lastCleanupSaudiDate", todaySaudi);
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [store, persistor]);
}
