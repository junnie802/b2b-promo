const promotionService = require('../services/promotionService');

function withPrizesVisibility(promotion) {
  const response = { ...promotion };
  if (!promotion.has_game) delete response.prizes;
  return response;
}

exports.list = async (req, res, next) => {
  try {
    const promotions = await promotionService.list({ role: req.user.role, status: req.query.status });
    res.status(200).json(promotions);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const promotion = await promotionService.getById(req.params.id);
    res.status(200).json(withPrizesVisibility(promotion));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { type, title, description, start_date, end_date, has_game, prizes } = req.body;
    if (!type || !title || !start_date || !end_date || has_game === undefined) {
      const err = new Error('필수값을 입력해주세요');
      err.statusCode = 400;
      throw err;
    }
    const promotion = await promotionService.create({
      type,
      title,
      description,
      hasGame: has_game,
      startDate: start_date,
      endDate: end_date,
      prizes,
    });
    res.status(201).json(withPrizesVisibility(promotion));
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const promotion = await promotionService.changeStatus(req.params.id, req.body.action);
    res.status(200).json(withPrizesVisibility(promotion));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { type, title, description, start_date, end_date } = req.body;
    const prizes = 'prizes' in req.body ? req.body.prizes : undefined;
    const promotion = await promotionService.update(req.params.id, {
      type,
      title,
      description,
      startDate: start_date,
      endDate: end_date,
      prizes,
    });
    res.status(200).json(withPrizesVisibility(promotion));
  } catch (err) {
    next(err);
  }
};
