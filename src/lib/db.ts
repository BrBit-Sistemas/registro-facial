// app/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.NEXT_PUBLIC_USER_DB,
  host: process.env.NEXT_PUBLIC_HOST_DB,
  database: process.env.NEXT_PUBLIC_DATABASE_DB,
  password: process.env.NEXT_PUBLIC_PASSWORD_DB,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;