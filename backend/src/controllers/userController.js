const userService = require('../services/userService');

exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user.userId);
    res.status(200).json(user);
  } catch (err) { next(err); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, company_name } = req.body;
    const user = await userService.updateMe(req.user.userId, { name, companyName: company_name });
    res.status(200).json(user);
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 8) {
      const err = new Error('current_password와 8자 이상의 new_password가 필요합니다');
      err.statusCode = 400;
      throw err;
    }
    await userService.changePassword(req.user.userId, {
      currentPassword: current_password,
      newPassword: new_password,
    });
    res.status(204).send();
  } catch (err) { next(err); }
};
