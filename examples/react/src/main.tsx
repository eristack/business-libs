import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createJwtAuthClient,
  createLocalStorageTokenStorage,
} from "@eristack/jwt-auth/client";
import { JwtAuthProvider } from "@eristack/jwt-auth/react";
import { App } from "./App.js";
import "./styles.css";

/**
 * App owns URL + storage. The library only receives what we inject.
 * Vite proxies /auth and /me to the Express example when baseUrl is "".
 */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

const client = createJwtAuthClient({
  baseUrl: () => apiBaseUrl,
  storage: createLocalStorageTokenStorage("example.react"),
  credentials: "same-origin",
  fetch,
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
