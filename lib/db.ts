import { PrismaClient as PostgresClient } from "../generated/postgres";
import { PrismaClient as SqliteClient } from "../generated/sqlite";

const esPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");

const globalForDb = globalThis as unknown as {
  pg?: PostgresClient;
  sqlite?: SqliteClient;
};

export const prisma = esPostgres
  ? (globalForDb.pg ?? (globalForDb.pg = new PostgresClient()))
  : (globalForDb.sqlite ?? (globalForDb.sqlite = new SqliteClient())) as unknown as PostgresClient;