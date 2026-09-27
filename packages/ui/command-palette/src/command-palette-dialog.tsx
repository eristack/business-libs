import type { ReactNode } from "react";

export type CommandPaletteDialogProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: ReactNode;
};

export function CommandPaletteDialog({
  open,
  onClose,
  title = "Commands",
  children,
}: CommandPaletteDialogProps) {
  if (!open) return null;
  return (
    <div
      className="erista-command-palette"
      data-component="command-palette-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="erista-command-palette__backdrop" onClick={onClose} />
      <div className="erista-command-palette__panel">
        <header>{title}</header>
        <div className="erista-command-palette__body">{children}</div>
      </div>
    </div>
  );
}
