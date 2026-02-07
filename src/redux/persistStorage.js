import localforage from "localforage";

/**
 * Redux-persist storage engine using localForage with IndexedDB only.
 * Persists across page refresh and provides async API compatible with redux-persist.
 */
/** IndexedDB store used by redux-persist; export for logout/cleanup (e.g. .clear()). */
export const reduxPersistStore = localforage.createInstance({
  name: "redux-persist",
  storeName: "persist",
  driver: localforage.INDEXEDDB,
  description: "Redux persisted state (tasks whitelist)",
});

/**
 * Async storage adapter for redux-persist.
 * Implements getItem(key), setItem(key, value), removeItem(key) returning Promises.
 */
export const persistStorage = {
  getItem: (key) => reduxPersistStore.getItem(key),
  setItem: (key, value) => reduxPersistStore.setItem(key, value),
  removeItem: (key) => reduxPersistStore.removeItem(key),
};

export default persistStorage;
