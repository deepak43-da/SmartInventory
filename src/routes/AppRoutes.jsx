import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import TaskList from "../pages/TaskList";
import TaskDetail from "../pages/TaskDetail";
import React from "react";
export default function AppRoutes() {


  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/read/:id" element={<TaskList />} />
      <Route
        path="/task/:Store/:ActivityID/:StoreID/:SupplierID/:ScheduleID/:Supplier/:Activity/:Duration/:DOWork"
        element={<TaskDetail />}
      />
     
    </Routes>
  );
}
