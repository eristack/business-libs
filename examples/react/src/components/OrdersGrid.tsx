import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createDataGridClient } from "@eristack/data-grid/client";
import {
  useDataGridController,
  useDataGridList,
  VALUELESS_OPS,
} from "@eristack/data-grid/react";
import { useJwtAuth } from "@eristack/jwt-auth/react";
import {
  orderGridSchema,
  type OrderDetail,
  type OrderListRow,
} from "../lib/orders-grid.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

type OrdersGridProps = {
  enabled: boolean;
};

/**
 * Demonstrates headless draft/commit:
 * - search types into draft; Enter / Search button commits
 * - filter modal edits rows without refetch; Apply / Close commits
 * - resetFilters + sortBy reset pagination to page 1
 */
export function OrdersGrid({ enabled }: OrdersGridProps) {
  const { client: auth } = useJwtAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const ordersClient = useMemo(
    () =>
      createDataGridClient<OrderListRow>({
        baseUrl: () => apiBaseUrl,
        path: "/orders",
        schema: orderGridSchema,
        credentials: "same-origin",
        getHeaders: async (): Promise<Record<string, string>> => {
          const token = await auth.ensureAccessToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [auth],
  );

  const controller = useDataGridController({
    schema: orderGridSchema,
    initialQuery: {
      mode: "advanced",
      filters: {
        type: "group",
        logic: "and",
        children: [
          {
            type: "clause",
            field: "status",
            op: "in",
            value: ["open", "fulfilled"],
          },
          { type: "clause", field: "customerActive", op: "eq", value: true },
        ],
      },
      sorts: [{ field: "orderedAt", dir: "desc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    },
  });

  const list = useDataGridList<OrderListRow>({
    schema: orderGridSchema,
    client: ordersClient,
    controller,
    scope: ["example", "orders"],
    enabled,
  });

  const detailQuery = useQuery({
    queryKey: ["example", "order", selectedId],
    enabled: enabled && Boolean(selectedId),
    queryFn: async (): Promise<OrderDetail> => {
      const token = await auth.ensureAccessToken();
      const res = await fetch(`${apiBaseUrl}/orders/${selectedId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "same-origin",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? `Failed to load ${selectedId}`);
      }
      return (await res.json()) as OrderDetail;
    },
  });

  const pageInfo = list.pageInfo?.mode === "offset" ? list.pageInfo : null;
  const sortField = list.draftSorts[0]?.field ?? "orderedAt";
  const sortDir = list.draftSorts[0]?.dir ?? "desc";

  function openFilters() {
    list.syncDraftFromCommitted();
    setFilterOpen(true);
  }

  function applyFilters() {
    list.commitFilters();
    setFilterOpen(false);
  }

  function cancelFilters() {
    list.syncDraftFromCommitted();
    setFilterOpen(false);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Orders data grid</h2>
          <p className="lede">
            Headless draft/commit: typing and filter rows stay local until Search /
            Apply. Reset and sort return to page 1.
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="button-secondary"
            disabled={list.isFetching}
            onClick={() => void list.refetch()}
          >
            Reload
          </button>
        </div>
      </div>

      <div className="grid-controls">
        <label className="field grow">
          <span>Search (draft)</span>
          <input
            value={list.draftSearch}
            placeholder="customer, number, notes…"
            onChange={(e) => {
              list.setDraftMode("search");
              list.setDraftSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") list.commitSearch();
            }}
            onBlur={() => {
              /* optional: commit on blur — demo uses explicit Search */
            }}
          />
        </label>
        <button type="button" onClick={() => list.commitSearch()}>
          Search
        </button>
        <button type="button" className="button-secondary" onClick={openFilters}>
          Filters{list.isDirty ? " •" : ""}
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() => list.resetFilters()}
        >
          Reset filters
        </button>

        <label className="field">
          <span>Sort</span>
          <select
            value={sortField}
            onChange={(e) => list.sortBy(e.target.value, sortDir)}
          >
            <option value="orderedAt">orderedAt</option>
            <option value="totalMinor">totalMinor</option>
            <option value="lineCount">lineCount</option>
            <option value="customerName">customerName</option>
            <option value="number">number</option>
          </select>
        </label>
        <label className="field">
          <span>Dir</span>
          <select
            value={sortDir}
            onChange={(e) =>
              list.sortBy(sortField, e.target.value as "asc" | "desc")
            }
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </label>
      </div>

      {filterOpen ? (
        <div className="filter-modal" role="dialog" aria-label="Filters">
          <div className="panel-head">
            <h3>Filters (draft)</h3>
            <div className="actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => list.addFilterRow()}
              >
                Add row
              </button>
              <button type="button" className="button-secondary" onClick={cancelFilters}>
                Cancel
              </button>
              <button type="button" onClick={applyFilters}>
                Apply
              </button>
            </div>
          </div>

          <label className="field">
            <span>Logic</span>
            <select
              value={list.filterLogic}
              onChange={(e) =>
                list.setFilterLogic(e.target.value as "and" | "or")
              }
            >
              <option value="and">and</option>
              <option value="or">or</option>
            </select>
          </label>

          <div className="filter-rows">
            {list.filterRows.length === 0 ? (
              <p className="lede">No rows — Add row or Apply empty to clear.</p>
            ) : (
              list.filterRows.map((row) => {
                const ops = list.opsForField(row.field);
                const needsValue = !VALUELESS_OPS.has(row.op);
                return (
                  <div key={row.id} className="filter-row">
                    <select
                      value={row.field}
                      onChange={(e) =>
                        list.updateFilterRow(row.id, { field: e.target.value })
                      }
                    >
                      {list.fields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={row.op}
                      onChange={(e) =>
                        list.updateFilterRow(row.id, {
                          op: e.target.value as typeof row.op,
                        })
                      }
                    >
                      {ops.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    {needsValue ? (
                      <input
                        value={
                          Array.isArray(row.value)
                            ? row.value.join(",")
                            : row.value == null
                              ? ""
                              : String(row.value)
                        }
                        placeholder="value (in: a,b)"
                        onChange={(e) =>
                          list.updateFilterRow(row.id, { value: e.target.value })
                        }
                      />
                    ) : (
                      <span className="muted">—</span>
                    )}
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => list.removeFilterRow(row.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      {list.error ? <p className="error">{list.error.message}</p> : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Region</th>
              <th>Status</th>
              <th>Lines</th>
              <th>Total</th>
              <th>Assignee</th>
              <th>Ordered</th>
            </tr>
          </thead>
          <tbody>
            {list.isPending ? (
              <tr>
                <td colSpan={8}>Loading…</td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={8}>No orders match.</td>
              </tr>
            ) : (
              list.items.map((row) => (
                <tr
                  key={row.id}
                  className={selectedId === row.id ? "is-selected" : undefined}
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="mono">{row.number}</td>
                  <td>
                    <div>{row.customerName}</div>
                    <div className="muted mono">{row.customerEmail}</div>
                  </td>
                  <td>{row.customerRegion}</td>
                  <td>{row.status}</td>
                  <td>{row.lineCount}</td>
                  <td className="mono">{row.total}</td>
                  <td>{row.assigneeName ?? "—"}</td>
                  <td>{new Date(row.orderedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageInfo ? (
        <div className="pager">
          <button
            type="button"
            className="button-secondary"
            disabled={!pageInfo.hasPrev || list.isFetching}
            onClick={() => list.setPage(pageInfo.page - 1)}
          >
            Prev
          </button>
          <span className="muted">
            page {pageInfo.page}/{pageInfo.totalPages} · {pageInfo.total} rows
          </span>
          <button
            type="button"
            className="button-secondary"
            disabled={!pageInfo.hasNext || list.isFetching}
            onClick={() => list.setPage(pageInfo.page + 1)}
          >
            Next
          </button>
        </div>
      ) : null}

      <details className="wire">
        <summary>Committed query (fetch key)</summary>
        <pre className="mono">{list.queryString || "(empty)"}</pre>
      </details>

      {selectedId ? (
        <div className="detail">
          <div className="panel-head">
            <h3>Order detail</h3>
            <button
              type="button"
              className="button-secondary"
              onClick={() => setSelectedId(null)}
            >
              Close
            </button>
          </div>
          {detailQuery.isPending ? <p className="lede">Loading lines…</p> : null}
          {detailQuery.error ? (
            <p className="error">{detailQuery.error.message}</p>
          ) : null}
          {detailQuery.data ? (
            <>
              <p className="lede">
                {detailQuery.data.number} · {detailQuery.data.customerName} ·{" "}
                {detailQuery.data.lineCount} lines · {detailQuery.data.total}
              </p>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailQuery.data.lines.length === 0 ? (
                      <tr>
                        <td colSpan={4}>No lines.</td>
                      </tr>
                    ) : (
                      detailQuery.data.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="mono">{line.sku}</td>
                          <td>{line.productName}</td>
                          <td>{line.qty}</td>
                          <td className="mono">{line.lineTotal}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
