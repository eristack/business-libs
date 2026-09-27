import { useCallback, useState, type ChangeEvent } from "react";
import { submitAmountOnlyFormValue } from "../form.js";

export type UseMoneyFieldOptions = {
  currency: string;
  value: string;
  onChange: (amount: string) => void;
  required?: boolean;
  round?: boolean;
};

export function useMoneyField(options: UseMoneyFieldOptions) {
  const { currency, value, onChange, required, round } = options;
  const [error, setError] = useState<string | undefined>();

  const validate = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        if (required) return "Amount is required";
        return undefined;
      }
      try {
        submitAmountOnlyFormValue(raw, currency, { round });
        return undefined;
      } catch (e) {
        return e instanceof Error ? e.message : "Invalid amount";
      }
    },
    [currency, required, round],
  );

  const amountInputProps = {
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      onChange(next);
      setError(validate(next));
    },
    onBlur: () => setError(validate(value)),
  };

  return {
    currency,
    error,
    amountInputProps,
    clearError: () => setError(undefined),
  };
}
