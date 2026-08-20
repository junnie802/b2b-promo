const authService = require('../services/authService');

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name, company_name } = req.body;
    if (!email || !password || !name || !company_name) {
      const err = new Error('필수값을 입력해주세요');
      err.statusCode = 400;
      throw err;
    }
    const user = await authService.signup({ email, password, name, companyName: company_name });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refresh({ refreshToken: refresh_token });
    res.status(200).json({
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    await authService.logout({ refreshToken: refresh_token });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
