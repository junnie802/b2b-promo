const { hashPassword, comparePassword } = require('./password');

describe('hashPassword', () => {
  it('원문과 다른 bcrypt 해시를 반환한다', async () => {
    const plain = 'p@ssw0rd!';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);
  });
});

describe('comparePassword', () => {
  it('올바른 원문 비밀번호는 true를 반환한다', async () => {
    const plain = 'p@ssw0rd!';
    const hash = await hashPassword(plain);

    await expect(comparePassword(plain, hash)).resolves.toBe(true);
  });

  it('틀린 비밀번호는 false를 반환한다', async () => {
    const plain = 'p@ssw0rd!';
    const hash = await hashPassword(plain);

    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });
});
