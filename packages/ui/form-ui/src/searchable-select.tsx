import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

export type SearchableSelectOption = {
  value: string;
  label: string;
  searchText?: string;
};

export type SearchableSelectProps = {
  value: string | null;
  onValueChange: (value: string) => void;
  options: readonly SearchableSelectOption[];
  placeholder?: string;
  /** Controlled filter string (server search). When omitted, options filter client-side. */
  search?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  emptyMessage?: ReactNode;
};

function optionHaystack(option: SearchableSelectOption): string {
  return `${option.label} ${option.searchText ?? ""}`.toLowerCase();
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Search…",
  search: controlledSearch,
  onSearchChange,
  isLoading = false,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  emptyMessage = "No matches",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const search = controlledSearch ?? internalSearch;

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (onSearchChange) return options;
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => optionHaystack(o).includes(q));
  }, [options, search, onSearchChange]);

  function setSearch(next: string) {
    if (onSearchChange) onSearchChange(next);
    else setInternalSearch(next);
    setOpen(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="erista-searchable-select"
      data-component="searchable-select"
      data-open={open ? "" : undefined}
    >
      <input
        id={id}
        type="text"
        className="erista-searchable-select__input"
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        disabled={disabled}
        placeholder={selected && !open ? selected.label : placeholder}
        value={open || search ? search : (selected?.label ?? "")}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
      />
      {open && !disabled ? (
        <ul className="erista-searchable-select__listbox" role="listbox">
          {isLoading ? (
            <li className="erista-searchable-select__status" role="presentation">
              Loading…
            </li>
          ) : filtered.length === 0 ? (
            <li className="erista-searchable-select__status" role="presentation">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  className="erista-searchable-select__option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onValueChange(option.value);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
