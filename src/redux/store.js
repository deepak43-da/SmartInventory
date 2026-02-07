
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
        ignoredActions: [
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
          "ADD_TO_SYNC_QUEUE",
          "UPDATE_DISPLAY_IMAGE",
          "CAPTURE_IMAGE"
        ],
        // Also ignore the base64 data paths if needed, 
        // but ignoring the actions and knowing it's dev-only is usually enough.
        // For maximum performance we can also ignore paths:
        ignoredPaths: ["tasks.queue", "tasks.offlineImages", "tasks.tasks"],
      },
      immutableCheck: {
        ignoredPaths: ["tasks.queue", "tasks.offlineImages", "tasks.tasks"],
      },
    }),
});

export const persistor = persistStore(store);