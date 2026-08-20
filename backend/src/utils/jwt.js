const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
}

function signRefreshToken(payload) {
  // jti: 같은 초에 재발급해도 로테이션마다 토큰 값이 달라지도록 보장 (payload+iat+exp만으로는 동일 토큰이 나올 수 있음)
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error('유효하지 않은 토큰입니다');
    error.statusCode = 401;
    throw error;
  }
}

function verifyAccessToken(token) {
  return verifyToken(token);
}

function verifyRefreshToken(token) {
  return verifyToken(token);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
