import "leaflet/dist/leaflet.css";
import "@/styles/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import App from "@/App";
import { ToastProvider } from "@/components/toast-provider";
import { useAuthStore } from "@/store/useAuthStore";

function AppBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <AppBootstrap />
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>,
);
