export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

export type TimestampFieldMode = "instantPaired" | "wallPaired";

export type ResolvedInstantColumnNames = {
  logicalName: string;
  instantSql: string;
  timezoneSql: string;
  instantProperty: string;
  timezoneProperty: string;
};

export type ResolvedWallColumnNames = {
  logicalName: string;
  localSql: string;
  timezoneSql: string;
  localProperty: string;
  timezoneProperty: string;
};

export type TimestampColumnNaming = {
  instantSuffix: string;
  wallLocalSuffix: string;
  timezoneSuffix: string;
  sharedTimezoneColumn: string;
};

export type TimestampAdapterOptions = {
  naming?: Partial<TimestampColumnNaming>;
  /** Separate timezone column property when not paired on same binding */
  timezoneColumn?: string;
};

export type TimestampGridFields = {
  instant?: string;
  local?: string;
  timezone?: string;
};
