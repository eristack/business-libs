import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createDataGridClient } from "@eristack/data-grid/client";
import { useDataGridList } from "@eristack/data-grid/react";
import { useJwtAuth } from "@eristack/jwt-auth/react";
import type { FilterNode } from "@eristack/data-grid";
import {
  CUSTOMER_REGIONS,
  ORDER_STATUSES,
  orderGridSchema,
  type OrderDetail,
  type OrderListRow,
} from "../lib/orders-grid.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function buildAdvancedFilters(input: {
  statuses: string[];
  regions: string[];
  minTotalMinor: number | null;
  minLines: number | null;
  activeOnly: boolean;
}): FilterNode | undefined {
  const children: FilterNode[] = [];

  if (input.statuses.length > 0) {
    children.push({
      type: "clause",
      field: "status",
      op: "in",
      value: input.statuses,
    });
  }
  if (input.regions.length > 0) {
    children.push({
      type: "clause",
      field: "customerRegion",
      op: "in",
      value: input.regions,
    });
  }
  if (input.minTotalMinor != null && input.minTotalMinor > 0) {
    children.push({
      type: "clause",
      field: "totalMinor",
      op: "gte",
      value: input.minTotalMinor,
    });
  }
  if (input.minLines != null && input.minLines > 0) {
    children.push({
      type: "clause",
      field: "lineCount",
      op: "gte",
      value: input.minLines,
    });
  }
  if (input.activeOnly) {
    children.push({
      type: "clause",
      field: "customerActive",
      op: "eq",
      value: true,
    });
  }

  if (children.length === 0) return undefined;
  if (children.length === 1) return children[0];
  return { type: "group", logic: "and", children };
}

type OrdersGridProps = {
  enabled: boolean;
};

export function OrdersGrid({ enabled }: OrdersGridProps) {
  const { client: auth } = useJwtAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<string[]>(["open", "fulfilled"]);
  const [regions, setRegions] = useState<string[]>([]);
  const [minTotalDollars, setMinTotalDollars] = useState("");
  const [minLines, setMinLines] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [sortField, setSortField] = useState("orderedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchText, setSearchText] = useState("");

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

  const list = useDataGridList<OrderListRow>({
    schema: orderGridSchema,
    client: ordersClient,
    scope: ["example", "orders"],
    enabled,
    initialQuery: {
      mode: "advanced",
      filters: buildAdvancedFilters({
        statuses: ["open", "fulfilled"],
        regions: [],
        minTotalMinor: null,
        minLines: null,
        activeOnly: true,
      }),
      sorts: [{ field: "orderedAt", dir: "desc" }],
      page: { mode: "offset", page: 1, pageSize: 10 },
    },
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

  function applyAdvanced() {
    const dollars = minTotalDollars.trim() === "" ? null : Number(minTotalDollars);
    const lines = minLines.trim() === "" ? null : Number(minLines);
    list.setMode("advanced");
    list.setFilters(
      buildAdvancedFilters({
        statuses,
        regions,
        minTotalMinor:
          dollars != null && Number.isFinite(dollars)
            ? Math.round(dollars * 100)
            : null,
        minLines: lines != null && Number.isFinite(lines) ? lines : null,
        activeOnly,
      }),
    );
    list.setSorts([{ field: sortField, dir: sortDir }]);
    list.setPage(1);
  }

  function applySearch() {
    list.setSearch(searchText);
    list.setSorts([{ field: sortField, dir: sortDir }]);
    list.setPage(1);
  }

  function toggleValue(
    values: string[],
    value: string,
    setter: (next: string[]) => void,
  ) {
    setter(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );
  }

  const pageInfo = list.pageInfo?.mode === "offset" ? list.pageInfo : null;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Orders data grid</h2>
          <p className="lede">
            Custom domain (customers → orders → lines → products) with relation
            fields, <code>SUM</code>/<code>COUNT</code> aggregates, and JSON
            search params via <code>@eristack/data-grid</code>.
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
        <label className="field">
          <span>Mode</span>
          <select
            value={list.query.mode}
            onChange={(e) => {
              const mode = e.target.value as "advanced" | "search";
              if (mode === "search") applySearch();
              else applyAdvanced();
            }}
          >
            <option value="advanced">advanced (filters)</option>
            <option value="search">search (q)</option>
          </select>
        </label>

        {list.query.mode === "search" ? (
          <label className="field grow">
            <span>Search q</span>
            <input
              value={searchText}
              placeholder="customer, number, notes…"
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
            />
          </label>
        ) : (
          <>
            <fieldset className="chip-set">
              <legend>status in</legend>
              {ORDER_STATUSES.map((status) => (
                <label key={status} className="chip">
                  <input
                    type="checkbox"
                    checked={statuses.includes(status)}
                    onChange={() => toggleValue(statuses, status, setStatuses)}
                  />
                  {status}
                </label>
              ))}
            </fieldset>
            <fieldset className="chip-set">
              <legend>region in</legend>
              {CUSTOMER_REGIONS.map((region) => (
                <label key={region} className="chip">
                  <input
                    type="checkbox"
                    checked={regions.includes(region)}
                    onChange={() => toggleValue(regions, region, setRegions)}
                  />
                  {region}
                </label>
              ))}
            </fieldset>
            <label className="field">
              <span>total ≥ $</span>
              <input
                inputMode="decimal"
                value={minTotalDollars}
                placeholder="e.g. 500"
                onChange={(e) => setMinTotalDollars(e.target.value)}
              />
            </label>
            <label className="field">
              <span>lines ≥</span>
              <input
                inputMode="numeric"
                value={minLines}
                placeholder="2"
                onChange={(e) => setMinLines(e.target.value)}
              />
            </label>
            <label className="chip">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
              />
              active customers
            </label>
          </>
        )}

        <label className="field">
          <span>Sort</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
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
            onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
          >
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            if (list.query.mode === "search") applySearch();
            else applyAdvanced();
          }}
        >
          Apply
        </button>
      </div>

      {list.error ? (
        <p className="error">{list.error.message}</p>
      ) : null}

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
        <summary>Wire query</summary>
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
                      <th>Unit</th>
                      <th>Line total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailQuery.data.lines.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No lines (zero-sum order).</td>
                      </tr>
                    ) : (
                      detailQuery.data.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="mono">{line.sku}</td>
                          <td>
                            {line.productName}{" "}
                            <span className="muted">({line.category})</span>
                          </td>
                          <td>{line.qty}</td>
                          <td className="mono">
                            {(line.unitPriceMinor / 100).toLocaleString(
                              undefined,
                              { style: "currency", currency: "USD" },
                            )}
                          </td>
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
