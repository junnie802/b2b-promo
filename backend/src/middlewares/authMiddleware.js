const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    const err = new Error('인증 토큰이 필요합니다');
    err.statusCode = 401;
    return next(err);
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      const err = new Error('권한이 없습니다');
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
}

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
