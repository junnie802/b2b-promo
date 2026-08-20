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

function mockPromotionRow(overrides = {}) {
  return {
    id: 1,
    type: 'discount',
    title: '여름 프로모션',
    description: '설명',
    status: 'active',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    has_game: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function mockApplicationRow(overrides = {}) {
  return {
    id: 1,
    promotion_id: 1,
    buyer_id: 2,
    status: 'applied',
    prize_id: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('POST /api/promotions/:id/applications', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('신청에 성공하면 201과 status=applied를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active', has_game: false })] });
      }
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('INSERT INTO applications')) {
        return Promise.resolve({ rows: [mockApplicationRow()] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('applied');
  });

  it('이미 신청한 프로모션이면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active' })] });
      }
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [{ id: 5, status: 'applied' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.stringMatching(/이미|기존/));
  });

  it('scheduled(미게시) 프로모션이면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'scheduled' })] });
      }
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('ended(종료) 프로모션이면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'ended' })] });
      }
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('has_game=true이면 추첨 결과(prize_id, prize_name)를 저장/응답한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    pool.query.mockImplementation((sql, params) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active', has_game: true })] });
      }
      if (sql.includes('FROM prizes')) {
        return Promise.resolve({ rows: [{ id: 10, name: '1등' }, { id: 11, name: '2등' }] });
      }
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('INSERT INTO applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ prize_id: params[2] })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(201);
    expect(res.body.prize_id).toBe(10);
    expect(res.body.prize_name).toBe('1등');

    const insertCall = pool.query.mock.calls.find(([sql]) => sql.includes('INSERT INTO applications'));
    expect(insertCall[1]).toEqual(expect.arrayContaining([10]));
  });

  it('존재하지 않는 프로모션이면 404를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/999/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(404);
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).post('/api/promotions/1/applications').send();

    expect(res.status).toBe(401);
  });

  it('admin 토큰으로도 신청할 수 있다 (role 제한 없음)', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active', has_game: false })] });
      }
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes('INSERT INTO applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ buyer_id: 1 })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(res.status).toBe(201);
  });

  it('완료조건1: 취소된 기존 신청이 있으면 INSERT 대신 UPDATE(reactivate)로 처리하고 status=applied를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'active', has_game: false })] });
      }
      if (sql.includes('FROM applications') && sql.includes('promotion_id')) {
        return Promise.resolve({ rows: [{ id: 5, status: 'cancelled' }] });
      }
      if (sql.includes('UPDATE applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ id: 5, status: 'applied' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('applied');

    const insertCall = pool.query.mock.calls.some(([sql]) => sql.includes('INSERT INTO applications'));
    const updateCall = pool.query.mock.calls.some(([sql]) => sql.includes('UPDATE applications'));
    expect(insertCall).toBe(false);
    expect(updateCall).toBe(true);
  });

  it('완료조건3: 취소된 기존 신청이 있어도 프로모션이 ended면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions')) {
        return Promise.resolve({ rows: [mockPromotionRow({ status: 'ended' })] });
      }
      if (sql.includes('FROM applications') && sql.includes('promotion_id')) {
        return Promise.resolve({ rows: [{ id: 5, status: 'cancelled' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/applications/:id/cancel', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('본인 신청을 취소하면 200과 status=cancelled를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ id: 5, buyer_id: 2, status: 'applied' })] });
      }
      if (sql.includes('UPDATE applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ id: 5, buyer_id: 2, status: 'cancelled' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/applications/5/cancel')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });

  it('존재하지 않는 id면 404를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/applications/999/cancel')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(404);
  });

  it('다른 사용자의 신청이면 404를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ id: 5, buyer_id: 999, status: 'applied' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/applications/5/cancel')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(404);
  });

  it('이미 취소된 신청이면 400을 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM applications')) {
        return Promise.resolve({ rows: [mockApplicationRow({ id: 5, buyer_id: 2, status: 'cancelled' })] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/applications/5/cancel')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send();

    expect(res.status).toBe(400);
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).patch('/api/applications/5/cancel').send();

    expect(res.status).toBe(401);
  });
});

describe('GET /api/applications/me', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('완료조건4: 본인의 신청 목록을 promotion/prize 정보와 함께 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM applications')) {
        return Promise.resolve({
          rows: [
            {
              id: 5,
              promotion_id: 1,
              buyer_id: 2,
              status: 'applied',
              prize_id: 10,
              created_at: new Date().toISOString(),
              promotion_title: '여름 프로모션',
              promotion_status: 'active',
              prize_name: '1등',
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/applications/me')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].promotion_title).toBe('여름 프로모션');
    expect(res.body[0].promotion_status).toBe('active');
    expect(res.body[0].prize_name).toBe('1등');
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).get('/api/applications/me');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/promotions/:id/applications', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('완료조건1: admin 토큰으로 조회하면 200과 buyer/company/prize 정보를 반환한다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('JOIN users')) {
        return Promise.resolve({
          rows: [
            {
              application_id: 1,
              buyer_name: '김담당',
              company_name: '행복식당',
              status: 'applied',
              prize_name: '1등',
              created_at: new Date().toISOString(),
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].buyer_name).toBe('김담당');
    expect(res.body[0].company_name).toBe('행복식당');
    expect(res.body[0].prize_name).toBe('1등');
  });

  it('완료조건2: buyer 토큰으로 요청하면 403을 반환한다', async () => {
    const res = await request(app)
      .get('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
  });

  it('완료조건3: cancelled 상태의 신청도 필터링되지 않고 응답에 포함된다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('JOIN users')) {
        return Promise.resolve({
          rows: [
            { application_id: 1, buyer_name: '김담당', company_name: '행복식당', status: 'applied', prize_name: '1등', created_at: new Date().toISOString() },
            { application_id: 2, buyer_name: '이담당', company_name: '기쁨상사', status: 'cancelled', prize_name: null, created_at: new Date().toISOString() },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .get('/api/promotions/1/applications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.some((r) => r.status === 'cancelled')).toBe(true);
  });

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).get('/api/promotions/1/applications');

    expect(res.status).toBe(401);
  });
});
