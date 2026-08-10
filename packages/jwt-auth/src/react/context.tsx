import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  JwtAuthClient,
  JwtAuthClientState,
} from "../client/index.js";

export interface JwtAuthContextValue {
  client: JwtAuthClient;
  state: JwtAuthClientState;
}

const JwtAuthContext = createContext<JwtAuthContextValue | null>(null);

export interface JwtAuthProviderProps {
  client: JwtAuthClient;
  children: ReactNode;
}

export function JwtAuthProvider({ client, children }: JwtAuthProviderProps) {
  const [state, setState] = useState<JwtAuthClientState>(() => client.getState());

  useEffect(() => {
    return client.subscribe(setState);
  }, [client]);

  return (
    <JwtAuthContext.Provider value={{ client, state }}>
      {children}
    </JwtAuthContext.Provider>
  );
}

export function useJwtAuthContext(): JwtAuthContextValue {
  const value = useContext(JwtAuthContext);
  if (!value) {
    throw new Error("useJwtAuth hooks must be used within JwtAuthProvider");
  }
  return value;
}
