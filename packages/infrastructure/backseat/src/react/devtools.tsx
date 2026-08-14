"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { BackseatSeedSource } from "../core/types.js";
import { useBackseat } from "./context.js";
import {
  documentPreview,
  formatSnapshot,
  parseDocumentJson,
  parseSnapshotJson,
  type DevtoolsCollectionState,
} from "./devtools-api.js";

export type BackseatDevtoolsProps = {
  /** Override seed for re-seed button — falls back to `createBackseat({ seed })`. */
  seed?: BackseatSeedSource;
  defaultOpen?: boolean;
  position?: "bottom-right" | "bottom-left";
};

const panelStyle: CSSProperties = {
  position: "fixed",
  bottom: 16,
  zIndex: 99999,
  width: 420,
  maxWidth: "calc(100vw - 32px)",
  maxHeight: "min(70vh, 560px)",
  display: "flex",
  flexDirection: "column",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,15,20,0.96)",
  color: "#f4f4f5",
  boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSize: 12,
};

const buttonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f4f4f5",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
};

const dangerButtonStyle: CSSProperties = {
  ...buttonStyle,
  borderColor: "rgba(248,113,113,0.35)",
  color: "#fecaca",
};

export function BackseatDevtools({
  seed,
  defaultOpen = false,
  position = "bottom-right",
}: BackseatDevtoolsProps) {
  const backseat = useBackseat();
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<"data" | "snapshot">("data");
  const [collections, setCollections] = useState<DevtoolsCollectionState[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [newDocJson, setNewDocJson] = useState('{\n  "id": "new-id"\n}');
  const [snapshotJson, setSnapshotJson] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const panelPosition = useMemo(
    () => ({ ...panelStyle, [position === "bottom-right" ? "right" : "left"]: 16 }),
    [position],
  );

  const refresh = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const names = await backseat.store.listCollections();
      const loaded = await Promise.all(
        names.map(async (name) => {
          const documents = await backseat.store.list(name);
          return { name, count: documents.length, documents };
        }),
      );
      setCollections(loaded);
      if (!selected && loaded[0]) setSelected(loaded[0].name);
      if (selected && !names.includes(selected) && loaded[0]) {
        setSelected(loaded[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setBusy(false);
    }
  }, [backseat.store, selected]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const active = collections.find((item) => item.name === selected);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open Backseat devtools"
        onClick={() => setOpen(true)}
        style={{
          ...buttonStyle,
          position: "fixed",
          bottom: 16,
          [position === "bottom-right" ? "right" : "left"]: 16,
          zIndex: 99998,
        }}
      >
        Backseat
      </button>
    );
  }

  return (
    <div style={panelPosition} data-backseat-devtools>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <strong style={{ fontSize: 13 }}>Backseat devtools</strong>
        <button type="button" style={buttonStyle} onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexWrap: "wrap",
        }}
      >
        <button type="button" style={buttonStyle} disabled={busy} onClick={() => refresh()}>
          Refresh
        </button>
        <button
          type="button"
          style={dangerButtonStyle}
          disabled={busy}
          onClick={() => run(() => backseat.reset(), "Store cleared")}
        >
          Reset
        </button>
        <button
          type="button"
          style={buttonStyle}
          disabled={busy}
          onClick={() =>
            run(async () => {
              if (seed) {
                const value = typeof seed === "function" ? await seed() : seed;
                await backseat.seed(value);
                return;
              }
              await backseat.reseed();
            }, "Re-seeded")
          }
        >
          Re-seed
        </button>
        <button
          type="button"
          style={buttonStyle}
          disabled={busy}
          onClick={() => setTab(tab === "data" ? "snapshot" : "data")}
        >
          {tab === "data" ? "Snapshot" : "Data"}
        </button>
      </div>

      {(message || error) && (
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: error ? "#fecaca" : "#bbf7d0",
          }}
        >
          {error ?? message}
        </div>
      )}

      <div style={{ overflow: "auto", flex: 1, padding: 12 }}>
        {tab === "data" ? (
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ opacity: 0.7 }}>Collection</span>
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                style={{
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  color: "inherit",
                  padding: "6px 8px",
                }}
              >
                {collections.length === 0 ? (
                  <option value="">(none)</option>
                ) : (
                  collections.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.count})
                    </option>
                  ))
                )}
              </select>
            </label>

            {active ? (
              <div style={{ display: "grid", gap: 8 }}>
                {active.documents.map((doc) => (
                  <div
                    key={String(doc.id)}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{String(doc.id)}</div>
                      <div style={{ opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {documentPreview(doc)}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={dangerButtonStyle}
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => backseat.store.delete(active.name, String(doc.id)),
                          `Deleted ${String(doc.id)}`,
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ opacity: 0.7 }}>Insert document (JSON)</span>
              <textarea
                value={newDocJson}
                onChange={(event) => setNewDocJson(event.target.value)}
                rows={6}
                style={{
                  width: "100%",
                  resize: "vertical",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  color: "inherit",
                  padding: 8,
                  fontFamily: "ui-monospace, monospace",
                }}
              />
            </label>
            <button
              type="button"
              style={buttonStyle}
              disabled={busy || !selected}
              onClick={() =>
                run(async () => {
                  const doc = parseDocumentJson(newDocJson);
                  await backseat.store.create(selected, doc);
                }, "Document inserted")
              }
            >
              Insert into {selected || "collection"}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <button
              type="button"
              style={buttonStyle}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const snap = await backseat.snapshot();
                  setSnapshotJson(formatSnapshot(snap));
                }, "Snapshot loaded")
              }
            >
              Load snapshot
            </button>
            <textarea
              value={snapshotJson}
              onChange={(event) => setSnapshotJson(event.target.value)}
              rows={14}
              placeholder="Export, edit, or paste a full snapshot JSON"
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.25)",
                color: "inherit",
                padding: 8,
                fontFamily: "ui-monospace, monospace",
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                style={buttonStyle}
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await navigator.clipboard.writeText(snapshotJson);
                  }, "Copied to clipboard")
                }
              >
                Copy
              </button>
              <button
                type="button"
                style={buttonStyle}
                disabled={busy || snapshotJson.length === 0}
                onClick={() =>
                  run(async () => {
                    await backseat.seed(parseSnapshotJson(snapshotJson));
                  }, "Snapshot imported")
                }
              >
                Import snapshot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
