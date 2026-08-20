jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');
const applicationRepository = require('./applicationRepository');

describe('applicationRepository.findByPromotionAndBuyer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('기존 신청이 있으면 해당 row를 반환한다', async () => {
    const row = { id: 5, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: null, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [row] });

    const result = await applicationRepository.findByPromotionAndBuyer(1, 2);

    expect(result).toEqual(row);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('FROM applications'));
    expect(sql).toEqual(expect.stringContaining('WHERE promotion_id = $1'));
    expect(sql).toEqual(expect.stringContaining('AND buyer_id = $2'));
    expect(params).toEqual([1, 2]);
  });

  it('기존 신청이 없으면 undefined를 반환한다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await applicationRepository.findByPromotionAndBuyer(1, 2);

    expect(result).toBeUndefined();
    const [, params] = pool.query.mock.calls[0];
    expect(params).toEqual([1, 2]);
  });
});

describe('applicationRepository.create', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("status='applied'로 신청을 생성하고 RETURNING 결과를 반환한다", async () => {
    const created = { id: 1, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: 10, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [created] });

    const result = await applicationRepository.create({ promotionId: 1, buyerId: 2, prizeId: 10 });

    expect(result).toEqual(created);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('INSERT INTO applications'));
    expect(sql).toEqual(expect.stringContaining("'applied'"));
    expect(sql).toEqual(expect.stringContaining('RETURNING'));
    expect(params).toEqual([1, 2, 10]);
  });

  it('prizeId가 없으면 null로 params에 전달된다', async () => {
    const created = { id: 2, promotion_id: 1, buyer_id: 3, status: 'applied', prize_id: null, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [created] });

    const result = await applicationRepository.create({ promotionId: 1, buyerId: 3, prizeId: null });

    expect(result).toEqual(created);
    const [, params] = pool.query.mock.calls[0];
    expect(params).toEqual([1, 3, null]);
  });
});

describe('applicationRepository.findById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('존재하면 해당 row를 반환한다', async () => {
    const row = { id: 5, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: null, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [row] });

    const result = await applicationRepository.findById(5);

    expect(result).toEqual(row);
    const [, params] = pool.query.mock.calls[0];
    expect(params).toEqual([5]);
  });

  it('존재하지 않으면 undefined를 반환한다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await applicationRepository.findById(999);

    expect(result).toBeUndefined();
  });
});

describe('applicationRepository.updateStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("status를 갱신하고 RETURNING 결과를 반환한다", async () => {
    const updated = { id: 5, promotion_id: 1, buyer_id: 2, status: 'cancelled', prize_id: null, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const result = await applicationRepository.updateStatus(5, 'cancelled');

    expect(result).toEqual(updated);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('UPDATE applications'));
    expect(sql).toEqual(expect.stringContaining('SET status = $2'));
    expect(params).toEqual([5, 'cancelled']);
  });
});

describe('applicationRepository.reactivate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("status를 'applied'로, prize_id를 갱신하고 RETURNING 결과를 반환한다", async () => {
    const updated = { id: 5, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: 10, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const result = await applicationRepository.reactivate({ id: 5, prizeId: 10 });

    expect(result).toEqual(updated);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining("status = 'applied'"));
    expect(sql).toEqual(expect.stringContaining('prize_id = $2'));
    expect(params).toEqual([5, 10]);
  });

  it('prizeId가 없으면 null로 params에 전달된다', async () => {
    const updated = { id: 5, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: null, created_at: new Date().toISOString() };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const result = await applicationRepository.reactivate({ id: 5, prizeId: null });

    expect(result).toEqual(updated);
    const [, params] = pool.query.mock.calls[0];
    expect(params).toEqual([5, null]);
  });
});

describe('applicationRepository.findByBuyerId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('buyerId 기준으로 promotion/prize 정보를 조인하여 반환한다', async () => {
    const rows = [
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
    ];
    pool.query.mockResolvedValueOnce({ rows });

    const result = await applicationRepository.findByBuyerId(2);

    expect(result).toEqual(rows);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('JOIN promotions'));
    expect(sql).toMatch(/(LEFT )?JOIN prizes/);
    expect(sql).toEqual(expect.stringContaining('WHERE a.buyer_id = $1'));
    expect(params).toEqual([2]);
  });

  it('신청 내역이 없으면 빈 배열을 반환한다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await applicationRepository.findByBuyerId(2);

    expect(result).toEqual([]);
  });
});

describe('applicationRepository.findByPromotionId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('promotionId 기준으로 buyer/prize 정보를 조인하여 생성일 역순으로 반환한다', async () => {
    const rows = [
      {
        application_id: 1,
        buyer_name: '김담당',
        company_name: '행복식당',
        status: 'applied',
        prize_name: '1등',
        created_at: new Date().toISOString(),
      },
    ];
    pool.query.mockResolvedValueOnce({ rows });

    const result = await applicationRepository.findByPromotionId(1);

    expect(result).toEqual(rows);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('JOIN users'));
    expect(sql).toEqual(expect.stringContaining('LEFT JOIN prizes'));
    expect(sql).toEqual(expect.stringContaining('WHERE a.promotion_id = $1'));
    expect(sql).toEqual(expect.stringContaining('ORDER BY a.created_at DESC'));
    expect(params).toEqual([1]);
  });

  it('cancelled를 포함해 status로 필터링하지 않고 모두 반환한다', async () => {
    const rows = [
      { application_id: 1, buyer_name: '김담당', company_name: '행복식당', status: 'applied', prize_name: '1등', created_at: new Date().toISOString() },
      { application_id: 2, buyer_name: '이담당', company_name: '기쁨상사', status: 'cancelled', prize_name: null, created_at: new Date().toISOString() },
    ];
    pool.query.mockResolvedValueOnce({ rows });

    const result = await applicationRepository.findByPromotionId(1);

    expect(result).toEqual(rows);
    expect(result.some((r) => r.status === 'cancelled')).toBe(true);
  });

  it('신청 내역이 없으면 빈 배열을 반환한다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await applicationRepository.findByPromotionId(1);

    expect(result).toEqual([]);
  });
});

describe('아키텍처 규칙: 상위 계층 import 금지', () => {
  it('services 또는 controllers를 require하지 않는다', () => {
    const source = fs.readFileSync(path.join(__dirname, 'applicationRepository.js'), 'utf-8');

    expect(source).not.toMatch(/require\(['"]\.\.\/services/);
    expect(source).not.toMatch(/require\(['"]\.\.\/controllers/);
  });
});
