process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const authMiddleware = require('./authMiddleware');
const { signAccessToken } = require('../utils/jwt');

function mockReq(authorizationHeader) {
  return {
    headers: authorizationHeader ? { authorization: authorizationHeader } : {},
  };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  it('Authorization 헤더가 없으면 statusCode 401 에러로 next를 호출한다', () => {
    const req = mockReq();
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('Bearer 접두사가 없으면 statusCode 401 에러로 next를 호출한다', () => {
    const req = mockReq('invalid-header-format');
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('변조된 토큰이면 statusCode 401 에러로 next를 호출한다', () => {
    const token = signAccessToken({ userId: 1, role: 'buyer' });
    const req = mockReq(`Bearer ${token}x`);
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('만료된 토큰이면 statusCode 401 에러로 next를 호출한다', () => {
    const original = process.env.JWT_ACCESS_EXPIRES_IN;
    process.env.JWT_ACCESS_EXPIRES_IN = '0s';
    const expiredToken = signAccessToken({ userId: 1, role: 'buyer' });
    process.env.JWT_ACCESS_EXPIRES_IN = original;

    const req = mockReq(`Bearer ${expiredToken}`);
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('유효한 토큰이면 에러 없이 next()를 호출하고 req.user를 채운다', () => {
    const payload = { userId: 42, role: 'seller' };
    const token = signAccessToken(payload);
    const req = mockReq(`Bearer ${token}`);
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ userId: payload.userId, role: payload.role });
  });
});
