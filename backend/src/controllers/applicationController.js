const applicationService = require('../services/applicationService');

exports.apply = async (req, res, next) => {
  try {
    const application = await applicationService.apply(req.params.id, req.user.userId);
    res.status(201).json(application);
  } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
  try {
    const application = await applicationService.cancel(req.params.id, req.user.userId);
    res.status(200).json(application);
  } catch (err) { next(err); }
};

exports.listMine = async (req, res, next) => {
  try {
    const applications = await applicationService.listMine(req.user.userId);
    res.status(200).json(applications);
  } catch (err) { next(err); }
};

exports.listByPromotion = async (req, res, next) => {
  try {
    const applications = await applicationService.listByPromotion(req.params.id);
    res.status(200).json(applications);
  } catch (err) { next(err); }
};
