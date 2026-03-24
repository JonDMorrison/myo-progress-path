import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: "", // Jon will add DSN from sentry.io
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  enabled: import.meta.env.PROD,
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh the page.</p>}>
    <App />
  </Sentry.ErrorBoundary>
);
