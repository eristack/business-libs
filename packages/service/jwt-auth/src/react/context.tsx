import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createJwtAuthClient,
  type JwtAuthClient,
  type JwtAuthClientConfig,
  type JwtAuthClientState,
} from "../client/index.js";

export interface JwtAuthContextValue {
  client: JwtAuthClient;
  state: JwtAuthClientState;
}

const JwtAuthContext = createContext<JwtAuthContextValue | null>(null);

type ClientProps = {
  /** App-constructed client (fully injected). */
  client: JwtAuthClient;
  children: ReactNode;
};

type ConfigProps = {
  children: ReactNode;
  /**
   * Injected client config — same shape as `createJwtAuthClient`.
   * App supplies `baseUrl` (string or getter), `storage`, optional `fetch` / `getHeaders`.
   */
  clientConfig: JwtAuthClientConfig;
};

/**
 * Headless provider. Pass a ready `client`, or `clientConfig` with app-owned
 * `baseUrl` / `storage` / `fetch`. The library does not read env or invent URLs.
 */
export type JwtAuthProviderProps = ClientProps | ConfigProps;

function hasClient(props: JwtAuthProviderProps): props is ClientProps {
  return "client" in props;
}

export function JwtAuthProvider(props: JwtAuthProviderProps) {
  const ownsClient = !hasClient(props);
  const clientConfig = hasClient(props) ? null : props.clientConfig;
  const injectedClient = hasClient(props) ? props.client : null;

  const client = useMemo(() => {
    if (injectedClient) return injectedClient;
    if (!clientConfig) {
      throw new Error("JwtAuthProvider requires `client` or `clientConfig`");
    }
    return createJwtAuthClient(clientConfig);
  }, [injectedClient, clientConfig]);

  const ownedClientRef = useRef<JwtAuthClient | null>(null);
  if (ownsClient) {
    ownedClientRef.current = client;
  }

  const [state, setState] = useState<JwtAuthClientState>(() => client.getState());

  useEffect(() => {
    return client.subscribe(setState);
  }, [client]);

  useEffect(() => {
    return () => {
      if (ownsClient) {
        ownedClientRef.current?.dispose();
      }
    };
  }, [ownsClient, client]);

  return (
    <JwtAuthContext.Provider value={{ client, state }}>
      {props.children}
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
