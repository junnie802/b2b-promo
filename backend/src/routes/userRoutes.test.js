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
const { signAccessToken } = require('../utils/jwt');

const baseUser = {
  id: 1,
  email: 'buyer@example.com',
  role: 'buyer',
  name: '홍길동',
  company_name: '홍길동상사',
  created_at: new Date().toISOString(),
};

describe('GET /api/users/me', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('인증된 사용자의 정보를 200과 함께 반환하고 password_hash는 뺀다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    const passwordHash = await hashPassword('password123');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [{ ...baseUser, password_hash: passwordHash }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('buyer@example.com');
    expect(res.body.password_hash).toBeUndefined();
  });

  it('Authorization 헤더 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/me', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('name/company_name 변경 시 200과 변경된 User를 반환한다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    const passwordHash = await hashPassword('password123');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE users') && sql.includes('SET name')) {
        return Promise.resolve({
          rows: [{ ...baseUser, name: '새이름', company_name: '새거래처' }],
        });
      }
      if (sql.includes('FROM users') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [{ ...baseUser, password_hash: passwordHash }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '새이름', company_name: '새거래처' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('새이름');
    expect(res.body.company_name).toBe('새거래처');
    expect(res.body.password_hash).toBeUndefined();
  });

  it('name만 전달하면 company_name은 기존 값을 유지한 채 update가 호출된다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    const passwordHash = await hashPassword('password123');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE users') && sql.includes('SET name')) {
        return Promise.resolve({
          rows: [{ ...baseUser, name: '새이름' }],
        });
      }
      if (sql.includes('FROM users') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [{ ...baseUser, password_hash: passwordHash }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '새이름' });

    expect(res.status).toBe(200);
    const updateCall = pool.query.mock.calls.find(
      ([sql]) => sql.includes('UPDATE users') && sql.includes('SET name'),
    );
    expect(updateCall[1]).toEqual([1, '새이름', baseUser.company_name]);
  });
});

describe('PATCH /api/users/me/password', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('현재 비밀번호가 일치하지 않으면 400을 반환한다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    const otherHash = await hashPassword('otherPassword');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [{ ...baseUser, password_hash: otherHash }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ current_password: 'wrongPassword', new_password: 'newPassword123' });

    expect(res.status).toBe(400);
  });

  it('현재 비밀번호가 일치하면 204를 반환하고 password_hash를 갱신한다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    const passwordHash = await hashPassword('password123');

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM users') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [{ ...baseUser, password_hash: passwordHash }] });
      }
      if (sql.includes('UPDATE users') && sql.includes('SET password_hash')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ current_password: 'password123', new_password: 'newPassword123' });

    expect(res.status).toBe(204);

    const updatedPassword = pool.query.mock.calls.some(
      ([sql]) => sql.includes('UPDATE users') && sql.includes('SET password_hash'),
    );
    expect(updatedPassword).toBe(true);
  });

  it('current_password 또는 new_password가 없으면 400을 반환하고 DB를 조회하지 않는다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ current_password: 'password123' });

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('new_password가 8자 미만이면 400을 반환한다', async () => {
    const accessToken = signAccessToken({ userId: 1, role: 'buyer' });
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .patch('/api/users/me/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ current_password: 'password123', new_password: 'short' });

    expect(res.status).toBe(400);
  });
});
