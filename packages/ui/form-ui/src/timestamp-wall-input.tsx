import type { InputHTMLAttributes } from "react";

export type TimestampWallInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  /** Wall calendar date `YYYY-MM-DD`. */
  value: string;
  onValueChange?: (value: string) => void;
};

export function TimestampWallInput({
  value,
  onValueChange,
  ...rest
}: TimestampWallInputProps) {
  return (
    <input
      {...rest}
      type="date"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  );
}
