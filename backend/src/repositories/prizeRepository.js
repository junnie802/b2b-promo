const pool = require('../db/pool');

async function findByPromotionId(promotionId) {
  const { rows } = await pool.query(
    'SELECT id, promotion_id, name FROM prizes WHERE promotion_id = $1',
    [promotionId]
  );
  return rows;
}

async function createMany(promotionId, prizes) {
  if (!prizes || prizes.length === 0) return [];
  const placeholders = prizes.map((_, i) => `($1, $${i + 2})`).join(', ');
  const values = [promotionId, ...prizes.map((p) => p.name)];
  const { rows } = await pool.query(
    `INSERT INTO prizes (promotion_id, name) VALUES ${placeholders} RETURNING id, promotion_id, name`,
    values
  );
  return rows;
}

async function deleteByPromotionId(promotionId) {
  await pool.query('DELETE FROM prizes WHERE promotion_id = $1', [promotionId]);
}

module.exports = { findByPromotionId, createMany, deleteByPromotionId };
