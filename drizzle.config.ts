/**
 * Drizzle 配置
 */
import type { Config } from "drizzle-kit";
import { env } from "@/lib/env.mjs";

export default {
  /**
   * 数据库 schema 路径
   */
  schema: "./lib/db/**/*/schema.ts",
  /**
   * 数据库方言
   */
  dialect: "postgresql",
  /**
   * 数据库迁移路径
   */
  out: "./lib/db/migrations",
  /**
   * 数据库连接凭据
   */
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
