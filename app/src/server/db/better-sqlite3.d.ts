declare module "better-sqlite3" {
  export interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  export interface Statement {
    run(...parameters: unknown[]): RunResult;
    get(...parameters: unknown[]): unknown;
    all(...parameters: unknown[]): unknown[];
  }

  export default class Database {
    constructor(filename: string);
    close(): void;
    exec(sql: string): this;
    prepare(sql: string): Statement;
    pragma(source: string, options?: { simple?: boolean }): unknown;
    transaction<T extends (...parameters: never[]) => unknown>(fn: T): T & { immediate: T; deferred: T; exclusive: T };
  }
}
