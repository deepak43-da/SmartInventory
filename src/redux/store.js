// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import localforage from "localforage";
// import rootReducer from "./reducers/rootReducer";

// const persistConfig = {
//   key: "root",
//   storage: localforage,
//   whitelist: ["tasks"], // Only persist tasks (customize as needed)
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
// });

// export const persistor = persistStore(store);

// import { configureStore } from "@reduxjs/toolkit";
// import { persistStore, persistReducer, createMigrate } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import localforage from "localforage";
// import rootReducer from "./reducers/rootReducer";

// // Define migrations for version updates
// const migrations = {
//   0: (state) => {
//     // Migration from version 0 to 1
//     return {
//       ...state,
//       tasks: {
//         ...state.tasks,
//         tasks: state.tasks?.tasks || [],
//         pendingSync: state.tasks?.pendingSync || [],
//         lastSync: state.tasks?.lastSync || null,
//       }
//     };
//   },
//   1: (state) => {
//     // Migration from version 1 to 2
//     return {
//       ...state,
//       tasks: {
//         ...state.tasks,
//         queue: state.tasks?.queue || [],
//         networkStatus: state.tasks?.networkStatus || 'online'
//       }
//     };
//   }
// };

// const persistConfig = {
//   key: "root",
//   version: 1, // Increment this when changing state structure
//   storage: localforage,
//   whitelist: ["tasks"],
//   migrate: createMigrate(migrations, { debug: false }),
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//       },
//     }),
// });

// export const persistor = persistStore(store);

// store.js
// store.js

// store.js
import { configureStore } from "@reduxjs/toolkit";
import { 
  persistStore, 
  persistReducer, 
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./reducers/rootReducer";

const persistConfig = {
  key: "root",
  version: 1,
  storage: storage,
  whitelist: ["tasks"], // Only persist tasks state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);