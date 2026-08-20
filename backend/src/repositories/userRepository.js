const pool = require('../db/pool');

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

async function create({ email, passwordHash, name, companyName }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, name, company_name)
     VALUES ($1, $2, 'buyer', $3, $4)
     RETURNING id, email, role, name, company_name, created_at`,
    [email, passwordHash, name, companyName]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

async function update(id, { name, companyName }) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $2, company_name = $3 WHERE id = $1
     RETURNING id, email, role, name, company_name, created_at`,
    [id, name, companyName]
  );
  return rows[0];
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash]);
}

async function saveRefreshToken({ userId, token, expiresAt }) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
}

async function findRefreshToken(token) {
  const { rows } = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  return rows[0];
}

async function deleteRefreshToken(token) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

module.exports = {
  findByEmail,
  create,
  findById,
  update,
  updatePassword,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
};
