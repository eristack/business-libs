/** Row shape for master pickers that can be deactivated but stay visible when already selected. */
export type PickerMasterRow = {
  id: string;
  deactivatedAt?: string | null;
};

/**
 * Filter master rows for pickers: active rows plus the row already stored on the document.
 */
export function pickerMasters<T extends PickerMasterRow>(
  rows: readonly T[],
  currentId?: string | null,
): T[] {
  return rows.filter((row) => {
    if (row.deactivatedAt == null) return true;
    return currentId != null && row.id === currentId;
  });
}
