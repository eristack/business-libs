import { useCallback, useState, type ChangeEvent } from "react";

const WALL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type UseWallDateFieldOptions = {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
};

export function useWallDateField(options: UseWallDateFieldOptions) {
  const { value, onChange, required } = options;
  const [error, setError] = useState<string | undefined>();

  const validate = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        if (required) return "Date is required";
        return undefined;
      }
      if (!WALL_DATE_RE.test(raw)) return "Use YYYY-MM-DD";
      return undefined;
    },
    [required],
  );

  const inputProps = {
    value,
    type: "date" as const,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      onChange(next);
      setError(validate(next));
    },
    onBlur: () => setError(validate(value)),
  };

  return { error, inputProps, clearError: () => setError(undefined) };
}
