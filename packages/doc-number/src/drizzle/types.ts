export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

/**
 * App-owned Drizzle database handle.
 * Typed loosely so real `drizzle(...)` clients inject without friction.
 */
export interface DrizzleLikeDb {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (table: any) => { values: (values: any) => any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: () => { from: (table: any) => { where: (condition: any) => any } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (table: any) => { set: (values: any) => { where: (condition: any) => any } };
}
