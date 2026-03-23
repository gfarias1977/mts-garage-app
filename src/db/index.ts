import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString =
  process.env.USE_LOCAL_DB === 'true'
    ? process.env.LOCAL_DATABASE_URL!
    : process.env.DATABASE_URL!;

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
