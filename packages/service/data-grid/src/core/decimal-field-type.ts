export function isDecimalFieldType(type: string | undefined): boolean {
  return type === "decimal" || type === "money";
}
