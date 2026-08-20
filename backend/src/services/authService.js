const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

async function signup({ email, password, name, companyName }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('이미 등록된 이메일입니다');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  return userRepository.create({ email, passwordHash, name, companyName });
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  const invalidCredentialsError = () => {
    const err = new Error('이메일 또는 비밀번호가 일치하지 않습니다');
    err.statusCode = 401;
    return err;
  };

  if (!user) {
    throw invalidCredentialsError();
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw invalidCredentialsError();
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);
  await userRepository.saveRefreshToken({ userId: user.id, token: refreshToken, expiresAt });

  const { password_hash, ...userWithoutHash } = user;

  return { accessToken, refreshToken, user: userWithoutHash };
}

async function refresh({ refreshToken }) {
  const decoded = verifyRefreshToken(refreshToken);

  const stored = await userRepository.findRefreshToken(refreshToken);
  const invalidTokenError = () => {
    const err = new Error('유효하지 않거나 만료된 refresh token입니다');
    err.statusCode = 401;
    return err;
  };

  if (!stored) {
    throw invalidTokenError();
  }

  if (new Date(stored.expires_at) < new Date()) {
    throw invalidTokenError();
  }

  await userRepository.deleteRefreshToken(refreshToken);

  const newAccessToken = signAccessToken({ userId: decoded.userId, role: decoded.role });
  const newRefreshToken = signRefreshToken({ userId: decoded.userId, role: decoded.role });

  const newDecoded = jwt.decode(newRefreshToken);
  const expiresAt = new Date(newDecoded.exp * 1000);
  await userRepository.saveRefreshToken({ userId: decoded.userId, token: newRefreshToken, expiresAt });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout({ refreshToken }) {
  await userRepository.deleteRefreshToken(refreshToken);
}

module.exports = { signup, login, refresh, logout };
