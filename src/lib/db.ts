//lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: false, // লোকালে SSL use করব না
// });

// export default pool;