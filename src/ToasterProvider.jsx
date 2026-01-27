import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToasterProvider() {
  return <ToastContainer position="top-center" autoClose={2000} />;
}
