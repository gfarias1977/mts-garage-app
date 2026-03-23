import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const connectionString =
  process.env.USE_LOCAL_DB === 'true'
    ? process.env.LOCAL_DATABASE_URL!
    : process.env.DATABASE_URL!;

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
