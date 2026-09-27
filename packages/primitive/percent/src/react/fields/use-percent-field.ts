import { useCallback, useState, type ChangeEvent } from "react";
import { parsePercent, PercentParseError } from "../../core/percent.js";

export type UsePercentFieldOptions = {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
};

export function usePercentField(options: UsePercentFieldOptions) {
  const { value, onChange, required } = options;
  const [error, setError] = useState<string | undefined>();

  const validate = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        if (required) return "Rate is required";
        return undefined;
      }
      try {
        parsePercent(raw);
        return undefined;
      } catch (e) {
        return e instanceof PercentParseError ? e.message : "Invalid rate";
      }
    },
    [required],
  );

  const inputProps = {
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      onChange(next);
      setError(validate(next));
    },
    onBlur: () => setError(validate(value)),
  };

  return { error, inputProps, clearError: () => setError(undefined) };
}
