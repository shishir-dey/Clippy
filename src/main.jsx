import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// StrictMode removed to prevent double rendering and improve performance
createRoot(document.getElementById("root")).render(<App />);
