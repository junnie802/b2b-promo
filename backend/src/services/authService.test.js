jest.mock('../repositories/userRepository');
jest.mock('../utils/password');

const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');
const authService = require('./authService');

describe('authService.signup - EX-5: 이메일 중복 가입 거부', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('이미 등록된 이메일이면 400과 안내 메시지를 반환하고 create를 호출하지 않는다', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'exist@test.com' });

    await expect(
      authService.signup({ email: 'exist@test.com', password: 'pw1234', name: '홍길동', companyName: '행복상사' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('이미'),
    });
    expect(hashPassword).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('신규 이메일이면 정상적으로 가입된다', async () => {
    userRepository.findByEmail.mockResolvedValue(undefined);
    hashPassword.mockResolvedValue('hashed-pw');
    userRepository.create.mockResolvedValue({ id: 2, email: 'new@test.com' });

    const result = await authService.signup({
      email: 'new@test.com',
      password: 'pw1234',
      name: '홍길동',
      companyName: '행복상사',
    });

    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'new@test.com',
      passwordHash: 'hashed-pw',
      name: '홍길동',
      companyName: '행복상사',
    });
    expect(result).toEqual({ id: 2, email: 'new@test.com' });
  });
});
