process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_ACCESS_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const pool = require('../db/pool');
const app = require('../app');
const { hashPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');

describe('POST /api/auth/signup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('회원가입 성공 시 201과 password_hash를 뺀 User를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE email')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('INSERT INTO users')) {
        return Promise.resolve({
          rows: [
            {
              id: 1,
              email: 'buyer@example.com',
              role: 'buyer',
              name: '홍길동',
              company_name: '홍길동상사',
              created_at: new Date().toISOString(),
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).post('/api/auth/signup').send({
      email: 'buyer@example.com',
      password: 'password123',
      name: '홍길동',
      company_name: '홍길동상사',
    });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('buyer');
    expect(res.body.password_hash).toBeUndefined();
  });

  it('이메일 중복 시 400과 error 메시지를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE email')) {
        return Promise.resolve({ rows: [{ id: 1, email: 'buyer@example.com' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).post('/api/auth/signup').send({
      email: 'buyer@example.com',
      password: 'password123',
      name: '홍길동',
      company_name: '홍길동상사',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.stringContaining('이메일'));
  });
});

describe('POST /api/auth/login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('로그인 성공 시 200과 토큰/user를 반환하고 refresh token을 DB에 저장한다', async () => {
    const passwordHash = await hashPassword('password123');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE email')) {
        return Promise.resolve({
          rows: [
            {
              id: 1,
              email: 'buyer@example.com',
              role: 'buyer',
              name: '홍길동',
              company_name: '홍길동상사',
              password_hash: passwordHash,
              created_at: new Date().toISOString(),
            },
          ],
        });
      }
      if (sql.includes('INSERT INTO refresh_tokens')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'buyer@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined();

    const insertedRefreshToken = pool.query.mock.calls.some(
      ([sql]) => sql.includes('INSERT INTO refresh_tokens'),
    );
    expect(insertedRefreshToken).toBe(true);
  });

  it('비밀번호가 일치하지 않으면 401을 반환한다', async () => {
    const otherHash = await hashPassword('otherPassword');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE email')) {
        return Promise.resolve({
          rows: [
            {
              id: 1,
              email: 'buyer@example.com',
              role: 'buyer',
              name: '홍길동',
              company_name: '홍길동상사',
              password_hash: otherHash,
              created_at: new Date().toISOString(),
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'buyer@example.com',
      password: 'wrongPassword',
    });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout, /api/auth/refresh', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Authorization 헤더 없이 로그아웃하면 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refresh_token: 'some-refresh-token' });

    expect(res.status).toBe(401);
  });

  it('로그아웃 후 동일 refresh token으로 재발급을 시도하면 401을 반환한다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    const refreshToken = signRefreshToken({ userId: 1, role: 'buyer' });

    pool.query.mockImplementation((sql) => {
      if (sql.includes('DELETE') && sql.includes('refresh_tokens')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken });

    expect(logoutRes.status).toBe(204);

    jest.clearAllMocks();
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM refresh_tokens') && sql.includes('WHERE token')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(refreshRes.status).toBe(401);
  });

  it('유효한 refresh token으로 재발급하면 200과 새로 로테이션된 토큰을 반환한다', async () => {
    const refreshToken = signRefreshToken({ userId: 1, role: 'buyer' });
    const futureExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM refresh_tokens') && sql.includes('WHERE token')) {
        return Promise.resolve({
          rows: [{ id: 1, user_id: 1, token: refreshToken, expires_at: futureExpiresAt }],
        });
      }
      if (sql.includes('DELETE') && sql.includes('refresh_tokens')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('INSERT INTO refresh_tokens')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refresh_token: refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.refresh_token).not.toBe(refreshToken);
  });
});
