import React from "react";
import ReactDOM from "react-dom/client";
import 'leaflet/dist/leaflet.css';
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import { NotificationsProvider } from "./components/notifications/NotificationsProvider";
import "./index.css";
import "./styles/urbanex.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ToastProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </ToastProvider>
  </AuthProvider>
);
