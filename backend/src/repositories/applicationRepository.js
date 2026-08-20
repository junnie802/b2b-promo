const pool = require('../db/pool');

const COLUMNS = 'id, promotion_id, buyer_id, status, prize_id, created_at';

async function findByPromotionAndBuyer(promotionId, buyerId) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM applications WHERE promotion_id = $1 AND buyer_id = $2`,
    [promotionId, buyerId]
  );
  return rows[0];
}

async function create({ promotionId, buyerId, prizeId }) {
  const { rows } = await pool.query(
    `INSERT INTO applications (promotion_id, buyer_id, status, prize_id)
     VALUES ($1, $2, 'applied', $3)
     RETURNING ${COLUMNS}`,
    [promotionId, buyerId, prizeId ?? null]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM applications WHERE id = $1`, [id]);
  return rows[0];
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE applications SET status = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, status]
  );
  return rows[0];
}

async function reactivate({ id, prizeId }) {
  const { rows } = await pool.query(
    `UPDATE applications SET status = 'applied', prize_id = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, prizeId ?? null]
  );
  return rows[0];
}

async function findByBuyerId(buyerId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.promotion_id, a.buyer_id, a.status, a.prize_id, a.created_at,
            p.title AS promotion_title, p.status AS promotion_status,
            pz.name AS prize_name
     FROM applications a
     JOIN promotions p ON p.id = a.promotion_id
     LEFT JOIN prizes pz ON pz.id = a.prize_id
     WHERE a.buyer_id = $1
     ORDER BY a.created_at DESC`,
    [buyerId]
  );
  return rows;
}

async function findByPromotionId(promotionId) {
  const { rows } = await pool.query(
    `SELECT a.id AS application_id, u.name AS buyer_name, u.company_name,
            a.status, pz.name AS prize_name, a.created_at
     FROM applications a
     JOIN users u ON u.id = a.buyer_id
     LEFT JOIN prizes pz ON pz.id = a.prize_id
     WHERE a.promotion_id = $1
     ORDER BY a.created_at DESC`,
    [promotionId]
  );
  return rows;
}

module.exports = { findByPromotionAndBuyer, findById, create, updateStatus, reactivate, findByBuyerId, findByPromotionId };
