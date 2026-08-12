import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  createDocNumberClient,
  type DocNumberClient,
  type DocNumberClientConfig,
} from "../client/index.js";

export interface DocNumberContextValue {
  client: DocNumberClient;
}

const DocNumberContext = createContext<DocNumberContextValue | null>(null);

type ClientProps = {
  /** App-constructed client (fully injected). */
  client: DocNumberClient;
  children: ReactNode;
};

type ConfigProps = {
  children: ReactNode;
  /**
   * Injected client config — same shape as `createDocNumberClient`.
   * App supplies `baseUrl` (string or getter), optional `fetch` / `getHeaders`.
   */
  clientConfig: DocNumberClientConfig;
};

/**
 * Headless provider. Pass a ready `client`, or `clientConfig` with app-owned
 * `baseUrl` / `fetch` / `getHeaders`. No UI widgets.
 */
export type DocNumberProviderProps = ClientProps | ConfigProps;

function hasClient(props: DocNumberProviderProps): props is ClientProps {
  return "client" in props;
}

export function DocNumberProvider(props: DocNumberProviderProps) {
  const clientConfig = hasClient(props) ? null : props.clientConfig;
  const injectedClient = hasClient(props) ? props.client : null;

  const client = useMemo(() => {
    if (injectedClient) return injectedClient;
    if (!clientConfig) {
      throw new Error("DocNumberProvider requires `client` or `clientConfig`");
    }
    return createDocNumberClient(clientConfig);
  }, [injectedClient, clientConfig]);

  return (
    <DocNumberContext.Provider value={{ client }}>
      {props.children}
    </DocNumberContext.Provider>
  );
}

export function useDocNumberContext(): DocNumberContextValue {
  const value = useContext(DocNumberContext);
  if (!value) {
    throw new Error("useDocNumber hooks must be used within DocNumberProvider");
  }
  return value;
}
