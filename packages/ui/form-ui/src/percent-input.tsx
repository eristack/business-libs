import type { InputHTMLAttributes } from "react";

export type PercentInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onValueChange?: (value: string) => void;
};

export function PercentInput({
  value,
  onValueChange,
  ...rest
}: PercentInputProps) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  );
}
