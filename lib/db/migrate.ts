import { env } from "@/lib/env.mjs";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runMigrate = async () => {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const connection = postgres(env.DATABASE_URL, { max: 1 });

  const db = drizzle(connection);

  // 安装 pgvector 扩展（如果尚未安装）
  console.log("📦 Installing pgvector extension...");
  try {
    await connection`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log("✅ pgvector extension installed");
  } catch (err) {
    console.warn("⚠️  Warning: Could not install pgvector extension:", err);
    // 继续执行迁移，因为扩展可能已经存在
  }

  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "lib/db/migrations" });

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");

  await connection.end();

  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
