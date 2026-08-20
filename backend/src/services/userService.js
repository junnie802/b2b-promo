const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/password');

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  const { password_hash, ...rest } = user;
  return rest;
}

async function updateMe(userId, { name, companyName }) {
  const current = await userRepository.findById(userId);
  return userRepository.update(userId, {
    name: name ?? current.name,
    companyName: companyName ?? current.company_name,
  });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId);
  const isMatch = await comparePassword(currentPassword, user.password_hash);
  if (!isMatch) {
    const err = new Error('현재 비밀번호가 일치하지 않습니다');
    err.statusCode = 400;
    throw err;
  }
  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, passwordHash);
}

module.exports = { getMe, updateMe, changePassword };
