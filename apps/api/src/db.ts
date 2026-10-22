import postgres from "postgres";

export type Sql = postgres.Sql;
export type Tx = postgres.TransactionSql;

export function connect(url: string, max = 10): Sql {
  return postgres(url, {
    max,
    transform: postgres.camel, // snake_case columns come back as camelCase
    types: {
      numeric: { to: 1700, from: [1700], serialize: String, parse: Number },
      // Calendar dates stay "YYYY-MM-DD" strings; a JS Date would shift them by time zone.
      date: { to: 1082, from: [1082], serialize: (d: string) => d, parse: (d: string) => d },
    },
  });
}
