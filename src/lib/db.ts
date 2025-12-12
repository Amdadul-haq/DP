//lib/db.ts
import { Pool } from 'pg';

// For Supabase free tier in serverless:
// 1. Use Transaction pooler (port 6543) not Session pooler (5432)
// 2. Keep pool size small for serverless
// 3. Set connection timeout
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Critical for Supabase free tier + serverless
  idleTimeoutMillis: 10000, // Close idle connections after 10s
  connectionTimeoutMillis: 20000, // 20 seconds for complex transactions in production
  allowExitOnIdle: true // Allow pool to close when all clients idle
});

// Log pool errors
pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err);
});

export default pool;
// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: false, // লোকালে SSL use করব না
// });

// export default pool;