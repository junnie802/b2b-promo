const promotionRepository = require('../repositories/promotionRepository');
const prizeRepository = require('../repositories/prizeRepository');

async function list({ role, status }) {
  if (role === 'admin') {
    return status ? promotionRepository.findAll({ statuses: [status] }) : promotionRepository.findAll();
  }
  const allowed = ['scheduled', 'active'];
  const statuses = allowed.includes(status) ? [status] : allowed;
  return promotionRepository.findAll({ statuses });
}

async function getById(id) {
  const promotion = await promotionRepository.findById(id);
  if (!promotion) {
    const err = new Error('프로모션을 찾을 수 없습니다');
    err.statusCode = 404;
    throw err;
  }
  return promotion;
}

async function create({ type, title, description, hasGame, startDate, endDate, prizes }) {
  const promotion = await promotionRepository.create({ type, title, description, hasGame, startDate, endDate });
  const createdPrizes = hasGame && prizes && prizes.length > 0 ? await prizeRepository.createMany(promotion.id, prizes) : [];
  return { ...promotion, prizes: createdPrizes };
}

async function update(id, { type, title, description, startDate, endDate, prizes }) {
  const existing = await getById(id); // 없으면 404 throw, 부분 수정 시 기존 값과 병합하기 위한 조회
  const updated = await promotionRepository.update(id, {
    type: type ?? existing.type,
    title: title ?? existing.title,
    description: description ?? existing.description,
    startDate: startDate ?? existing.start_date,
    endDate: endDate ?? existing.end_date,
  });
  let finalPrizes = existing.prizes;
  if (prizes !== undefined) {
    await prizeRepository.deleteByPromotionId(id);
    finalPrizes = prizes.length > 0 ? await prizeRepository.createMany(id, prizes) : [];
  }
  return { ...updated, prizes: finalPrizes };
}

const TRANSITIONS = {
  publish: { from: 'scheduled', to: 'active' },
  end: { from: 'active', to: 'ended' },
};

async function changeStatus(id, action) {
  const transition = TRANSITIONS[action];
  if (!transition) {
    const err = new Error('허용되지 않는 action입니다');
    err.statusCode = 400;
    throw err;
  }

  const existing = await getById(id); // 없으면 404 throw (기존 getById 재사용), prizes 포함해서 반환됨

  if (existing.status !== transition.from) {
    const err = new Error('허용되지 않는 상태 전환입니다');
    err.statusCode = 400;
    throw err;
  }

  if (action === 'publish' && existing.has_game && (!existing.prizes || existing.prizes.length === 0)) {
    const err = new Error('경품이 없어 게시할 수 없습니다');
    err.statusCode = 400;
    throw err;
  }

  return promotionRepository.updateStatus(id, transition.to);
}

module.exports = { list, getById, create, update, changeStatus };
