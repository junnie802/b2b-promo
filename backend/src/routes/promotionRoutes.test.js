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
const { signAccessToken } = require('../utils/jwt');

const adminToken = signAccessToken({ userId: 1, role: 'admin' });
const buyerToken = signAccessToken({ userId: 2, role: 'buyer' });

const basePromotion = {
  type: 'discount',
  title: '여름 프로모션',
  description: '설명',
  start_date: '2026-08-01',
  end_date: '2026-08-31',
};

function mockPromotionRow(overrides = {}) {
  return {
    id: 1,
    type: 'discount',
    title: '여름 프로모션',
    description: '설명',
    status: 'scheduled',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    has_game: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('POST /api/promotions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('admin이 등록하면 201과 status=scheduled를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('INSERT INTO promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: false })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...basePromotion, has_game: false });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('scheduled');
  });

  it('has_game=true이고 prizes가 있으면 경품을 저장하고 응답에 포함한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('INSERT INTO promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: true })] });
      }
      if (sql.includes('INSERT INTO prizes')) {
        return Promise.resolve({ rows: [{ id: 1, name: '1등' }, { id: 2, name: '2등' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...basePromotion,
        has_game: true,
        prizes: [{ name: '1등' }, { name: '2등' }],
      });

    expect(res.status).toBe(201);
    const names = res.body.prizes.map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(['1등', '2등']));

    const insertedPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('INSERT INTO prizes'));
    expect(insertedPrizes).toBe(true);
  });

  it('has_game=false이면 prizes를 전달해도 저장/응답에 포함하지 않는다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('INSERT INTO promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: false })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...basePromotion, has_game: false, prizes: [{ name: 'x' }] });

    expect(res.status).toBe(201);
    expect(res.body.prizes).toBeUndefined();

    const insertedPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('INSERT INTO prizes'));
    expect(insertedPrizes).toBe(false);
  });

  it('buyer 토큰으로 등록하면 403을 반환한다', async () => {
    const res = await request(app)
      .post('/api/promotions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ ...basePromotion, has_game: false });

    expect(res.status).toBe(403);
  });

  it('토큰 없이 등록하면 401을 반환한다', async () => {
    const res = await request(app).post('/api/promotions').send({ ...basePromotion, has_game: false });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/promotions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('buyer는 항상 scheduled/active만 조회한다 (status=ended를 요청해도 무시)', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow()] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions?status=ended')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);

    const call = pool.query.mock.calls.find(([sql]) => sql.includes('FROM promotions'));
    expect(call[0]).toEqual(expect.stringContaining('status = ANY'));
    const params = call[1];
    expect(params).toEqual(expect.arrayContaining([expect.arrayContaining(['scheduled', 'active'])]));
    const flatParams = params.flat();
    expect(flatParams).not.toContain('ended');
  });

  it('admin은 status 필터 없이 전체(ended 포함)를 조회한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'ended' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const call = pool.query.mock.calls.find(([sql]) => sql.includes('FROM promotions'));
    expect(call[0].includes('status = ANY')).toBe(false);
  });
});

describe('GET /api/promotions/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has_game=true이면 prizes 배열을 포함한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: true })] });
      }
      if (sql.includes('FROM prizes')) {
        return Promise.resolve({ rows: [{ id: 1, name: '1등' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions/1')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.prizes)).toBe(true);
  });

  it('has_game=false이면 prizes 필드가 없다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: false })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions/1')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.prizes).toBeUndefined();
  });

  it('존재하지 않는 id면 404를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions/999')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/promotions/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prizes 필드가 있으면 기존 경품을 삭제하고 새로 등록한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: true })] });
      }
      if (sql.includes('DELETE FROM prizes')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('INSERT INTO prizes')) {
        return Promise.resolve({ rows: [{ id: 3, name: '새경품' }] });
      }
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ has_game: true })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ prizes: [{ name: '새경품' }] });

    expect(res.status).toBe(200);

    const deletedPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('DELETE FROM prizes'));
    const insertedPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('INSERT INTO prizes'));
    expect(deletedPrizes).toBe(true);
    expect(insertedPrizes).toBe(true);
  });

  it('prizes 필드가 없으면 경품 관련 쿼리를 실행하지 않는다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ title: '수정된 제목' })] });
      }
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow()] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(200);

    const deletedPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('DELETE FROM prizes'));
    const insertedPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('INSERT INTO prizes'));
    expect(deletedPrizes).toBe(false);
    expect(insertedPrizes).toBe(false);
  });

  it('존재하지 않는 id면 404를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE promotions')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(404);
  });

  it('buyer 토큰으로 수정하면 403을 반환한다', async () => {
    const res = await request(app)
      .patch('/api/promotions/1')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/promotions/:id/status', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('scheduled 상태에서 publish하면 200과 status=active를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE promotions SET status')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active' })] });
      }
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'scheduled', has_game: false })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'publish' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('active 상태에서 end하면 200과 status=ended를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE promotions SET status')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'ended' })] });
      }
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'end' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ended');
  });

  it('이미 active인데 publish를 시도하면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'publish' });

    expect(res.status).toBe(400);
  });

  it('scheduled 상태인데 end를 시도하면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'scheduled' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'end' });

    expect(res.status).toBe(400);
  });

  it('알 수 없는 action 값이면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'scheduled' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'cancel' });

    expect(res.status).toBe(400);
  });

  it('has_game=true이고 경품이 0건이면 publish 시 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM prizes')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'scheduled', has_game: true })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'publish' });

    expect(res.status).toBe(400);
  });

  it('has_game=true이고 경품이 1건 이상이면 publish가 정상 진행된다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('UPDATE promotions SET status')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active', has_game: true })] });
      }
      if (sql.includes('FROM prizes')) {
        return Promise.resolve({ rows: [{ id: 1, name: '1등' }] });
      }
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'scheduled', has_game: true })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'publish' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('존재하지 않는 id면 404를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/promotions/999/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'publish' });

    expect(res.status).toBe(404);
  });

  it('buyer 토큰이면 403을 반환한다', async () => {
    const res = await request(app)
      .patch('/api/promotions/1/status')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ action: 'publish' });

    expect(res.status).toBe(403);
  });
});
