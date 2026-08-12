import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createJwtAuthClient,
  createLocalStorageTokenStorage,
} from "@eristack/jwt-auth/client";
import { JwtAuthProvider } from "@eristack/jwt-auth/react";
import { App } from "./App.js";
import "./styles.css";

/**
 * App owns URL + storage + QueryClient.
 * Vite proxies /auth and /me to the Express example when baseUrl is "".
 */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

const client = createJwtAuthClient({
  baseUrl: () => apiBaseUrl,
  storage: createLocalStorageTokenStorage("example.react"),
  credentials: "same-origin",
  fetch,
});

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) {
  throw new Error("root element missing");
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <JwtAuthProvider client={client}>
        <App />
      </JwtAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
