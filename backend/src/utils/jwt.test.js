const jwt = require('jsonwebtoken');

let signAccessToken;
let signRefreshToken;
let verifyAccessToken;
let verifyRefreshToken;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_ACCESS_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';

  // eslint-disable-next-line global-require
  ({ signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require('./jwt'));
});

const payload = { userId: 1, role: 'buyer' };

describe('signAccessToken / verifyAccessToken', () => {
  it('발급한 access token을 검증하면 payload가 복원된다', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  it('변조된 토큰은 statusCode 401 에러를 발생시킨다', () => {
    const token = signAccessToken(payload);
    const tampered = `${token}x`;

    expect.assertions(2);
    try {
      verifyAccessToken(tampered);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(401);
    }
  });

  it('만료된 토큰은 statusCode 401 에러를 발생시킨다', () => {
    const original = process.env.JWT_ACCESS_EXPIRES_IN;
    process.env.JWT_ACCESS_EXPIRES_IN = '0s';
    const expiredToken = signAccessToken(payload);
    process.env.JWT_ACCESS_EXPIRES_IN = original;

    expect.assertions(2);
    try {
      verifyAccessToken(expiredToken);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(401);
    }
  });
});

describe('signRefreshToken / verifyRefreshToken', () => {
  it('발급한 refresh token을 검증하면 payload가 복원된다', () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });
});

describe('access/refresh token 만료시간', () => {
  it('refresh token의 만료시간(exp-iat)이 access token보다 길다', () => {
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const accessDecoded = jwt.decode(accessToken);
    const refreshDecoded = jwt.decode(refreshToken);

    const accessTtl = accessDecoded.exp - accessDecoded.iat;
    const refreshTtl = refreshDecoded.exp - refreshDecoded.iat;

    expect(refreshTtl).toBeGreaterThan(accessTtl);
  });
});
