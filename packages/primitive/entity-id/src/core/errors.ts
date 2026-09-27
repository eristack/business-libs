export const ENTITY_ID_PARSE_CODE = "ENTITY_ID_PARSE" as const;

export class EntityIdParseError extends Error {
  readonly code = ENTITY_ID_PARSE_CODE;

  constructor(message: string) {
    super(message);
    this.name = "EntityIdParseError";
  }
}
