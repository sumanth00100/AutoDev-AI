/**
 * Run database migrations against Supabase PostgreSQL.
 * Usage: ts-node scripts/setup-db.ts
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });

  const schemaPath = path.join(__dirname, '../backend/database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running schema migration…');
  await pool.query(sql);
  console.log('Migration complete.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
