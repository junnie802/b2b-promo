const pool = require('../db/pool');
const prizeRepository = require('./prizeRepository');

const COLUMNS = 'id, type, title, description, status, has_game, start_date, end_date, created_at';

async function findAll({ statuses } = {}) {
  if (statuses && statuses.length > 0) {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM promotions WHERE status = ANY($1::varchar[]) ORDER BY created_at DESC`,
      [statuses]
    );
    return rows;
  }
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM promotions ORDER BY created_at DESC`);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM promotions WHERE id = $1`, [id]);
  const promotion = rows[0];
  if (!promotion) return undefined;
  const prizes = await prizeRepository.findByPromotionId(id);
  return { ...promotion, prizes };
}

async function create({ type, title, description, hasGame, startDate, endDate }) {
  const { rows } = await pool.query(
    `INSERT INTO promotions (type, title, description, status, has_game, start_date, end_date)
     VALUES ($1, $2, $3, 'scheduled', $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [type, title, description, hasGame, startDate, endDate]
  );
  return rows[0];
}

async function update(id, { type, title, description, startDate, endDate }) {
  const { rows } = await pool.query(
    `UPDATE promotions SET type = $2, title = $3, description = $4, start_date = $5, end_date = $6
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, type, title, description, startDate, endDate]
  );
  return rows[0];
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE promotions SET status = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, status]
  );
  return rows[0];
}

module.exports = { findAll, findById, create, update, updateStatus };
