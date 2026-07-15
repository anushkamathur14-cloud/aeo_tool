import "dotenv/config";
import { defineConfig } from "prisma/config";

// Demo deploys on Vercel can generate the client without a real database.
// Persistence only needs DATABASE_URL at runtime / migrate time.
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://brandsignal:brandsignal@localhost:5432/brandsignal";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
