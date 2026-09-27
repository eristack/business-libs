import type { ReactNode } from "react";

export type FormFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, hint, error, children }: FormFieldProps) {
  return (
    <label className="erista-form-field">
      {label ? <span className="erista-form-field__label">{label}</span> : null}
      {children}
      {hint ? <span className="erista-form-field__hint">{hint}</span> : null}
      {error ? <span className="erista-form-field__error">{error}</span> : null}
    </label>
  );
}
