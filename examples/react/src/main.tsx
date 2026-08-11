import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createJwtAuthClient } from "@eristack/jwt-auth/client";
import { JwtAuthProvider } from "@eristack/jwt-auth/react";
import { App } from "./App.js";
import "./styles.css";

const client = createJwtAuthClient({
  // Vite proxies /auth and /me to the Express example
  baseUrl: "",
  credentials: "same-origin",
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("root element missing");
}

createRoot(root).render(
  <StrictMode>
    <JwtAuthProvider client={client}>
      <App />
    </JwtAuthProvider>
  </StrictMode>,
);
