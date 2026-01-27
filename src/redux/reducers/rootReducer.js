// import { combineReducers } from "redux";
// import tasksReducer from "./tasksReducer";

// const rootReducer = combineReducers({
//   tasks: tasksReducer,
// });

// export default rootReducer;


import { combineReducers } from "redux";
import tasksReducer from "./tasksReducer";

const appReducer = combineReducers({
  tasks: tasksReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "RESET_STORE") {
    state = undefined; // 🔥 resets ALL reducers
  }
  return appReducer(state, action);
};

export default rootReducer;
