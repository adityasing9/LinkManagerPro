import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GoogleOAuthProvider } from "@react-oauth/google";


import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin"; // ✅ add this
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
  path="/admin"
  element={
    <ProtectedAdminRoute>
      <Admin />
    </ProtectedAdminRoute>
  }
/>
      </Routes>
    </AnimatePresence>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="720643802732-dbon104puu94gg2kdbrmq9rneh8s57p8.apps.googleusercontent.com">
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </GoogleOAuthProvider>
);