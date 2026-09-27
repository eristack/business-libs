import { useCallback, useState } from "react";

export function useCommandPalette(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((value) => !value), []);

  return {
    open,
    setOpen,
    openPalette,
    closePalette,
    togglePalette,
  };
}
