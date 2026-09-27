import { submitAmountOnlyFormValue } from "@eristack/money/react";
import type { InputHTMLAttributes } from "react";

export type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  amount: string;
  currency: string;
  onAmountChange?: (amount: string) => void;
  onParsed?: (amount: string) => void;
  round?: boolean;
};

export function MoneyInput({
  amount,
  currency,
  onAmountChange,
  onParsed,
  round,
  onBlur,
  ...rest
}: MoneyInputProps) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={amount}
      data-currency={currency}
      onChange={(event) => onAmountChange?.(event.target.value)}
      onBlur={(event) => {
        onBlur?.(event);
        const raw = event.target.value;
        if (raw === "") return;
        const money = submitAmountOnlyFormValue(raw, currency, { round });
        const normalized = money.toJSON().amount;
        onAmountChange?.(normalized);
        onParsed?.(normalized);
      }}
    />
  );
}
