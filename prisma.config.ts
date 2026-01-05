import path from "node:path";
import { defineConfig } from "prisma/config";

// Load environment variables
import "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  // Database connection for db push, db pull, etc.
  datasource: {
    url: process.env.DIRECT_URL!,
  },

  // Database connection for migrations
  migrate: {
    url: process.env.DIRECT_URL!,
  },

  // Database connection for Prisma Studio
  studio: {
    url: process.env.DIRECT_URL!,
  },
} as Parameters<typeof defineConfig>[0]);
