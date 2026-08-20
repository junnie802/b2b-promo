// backend/src/db-migrations/*.sql 를 파일명 순서(001, 002, ... , seed_admin)대로 실행한다.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'db-migrations');

async function migrate() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const client = new Client({ connectionString: process.env.DB_CONN_STRING });
  await client.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query(sql);
      console.log(`applied: ${file}`);
    }
  } finally {
    await client.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
