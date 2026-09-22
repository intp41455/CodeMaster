import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Filter benign WebSocket / HMR disconnection errors expected in the sandboxed preview iframe
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const message = typeof reason === "string" ? reason : reason?.message || "";
    if (
      message.includes("WebSocket closed without opened") ||
      message.includes("failed to connect to websocket") ||
      message.includes("WebSocket")
    ) {
      // Prevent Vite's dev-server HMR connection drop from crashing the app or showing unhandled rejection banner
      event.preventDefault();
      event.stopPropagation();
      console.info("[HMR/WebSocket info]: Sandboxed environment gracefully handled WebSocket disconnect.");
    }
  });

  window.addEventListener("error", (event) => {
    const message = event?.message || "";
    if (
      message.includes("WebSocket closed without opened") ||
      message.includes("failed to connect to websocket")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
