
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker
registerSW({ immediate: true });
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
