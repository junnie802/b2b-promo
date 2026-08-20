const applicationRepository = require('../repositories/applicationRepository');
const promotionService = require('./promotionService');

async function apply(promotionId, buyerId) {
  const promotion = await promotionService.getById(promotionId); // 없으면 404 throw

  if (promotion.status !== 'active') {
    const err = new Error('게시 중인 프로모션에만 참여 신청할 수 있습니다');
    err.statusCode = 400;
    throw err;
  }

  const existing = await applicationRepository.findByPromotionAndBuyer(promotionId, buyerId);
  if (existing && existing.status === 'applied') {
    const err = new Error('이미 참여 신청한 프로모션입니다');
    err.statusCode = 400;
    throw err;
  }

  let prize;
  if (promotion.has_game && promotion.prizes && promotion.prizes.length > 0) {
    prize = promotion.prizes[Math.floor(Math.random() * promotion.prizes.length)];
  }

  let application;
  if (existing && existing.status === 'cancelled') {
    application = await applicationRepository.reactivate({ id: existing.id, prizeId: prize ? prize.id : undefined });
  } else {
    try {
      application = await applicationRepository.create({
        promotionId,
        buyerId,
        prizeId: prize ? prize.id : undefined,
      });
    } catch (err) {
      if (err.code === '23505') {
        const dupErr = new Error('이미 참여 신청한 프로모션입니다');
        dupErr.statusCode = 400;
        throw dupErr;
      }
      throw err;
    }
  }

  return { ...application, prize_name: prize ? prize.name : null };
}

async function cancel(applicationId, buyerId) {
  const application = await applicationRepository.findById(applicationId);
  if (!application) {
    const err = new Error('신청 내역을 찾을 수 없습니다');
    err.statusCode = 404;
    throw err;
  }
  if (application.buyer_id !== Number(buyerId)) {
    const err = new Error('신청 내역을 찾을 수 없습니다');
    err.statusCode = 404;
    throw err;
  }
  if (application.status !== 'applied') {
    const err = new Error('취소할 수 없는 상태입니다');
    err.statusCode = 400;
    throw err;
  }
  return applicationRepository.updateStatus(applicationId, 'cancelled');
}

async function listMine(buyerId) {
  return applicationRepository.findByBuyerId(buyerId);
}

async function listByPromotion(promotionId) {
  return applicationRepository.findByPromotionId(promotionId);
}

module.exports = { apply, cancel, listMine, listByPromotion };
