jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');
const promotionRepository = require('./promotionRepository');

describe('promotionRepository.findAll', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('인자 없이 호출하면 WHERE 없이 전체 목록을 최신순으로 조회한다', async () => {
    const rows = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }];
    pool.query.mockResolvedValueOnce({ rows });

    const result = await promotionRepository.findAll();

    expect(result).toEqual(rows);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('FROM promotions'));
    expect(sql).toEqual(expect.stringContaining('ORDER BY created_at DESC'));
    expect(sql).not.toMatch(/WHERE/i);
    expect(params).toBeUndefined();
  });

  it('statuses가 주어지면 status = ANY($1) 조건으로 조회한다', async () => {
    const rows = [{ id: 1, title: 'A', status: 'active' }];
    pool.query.mockResolvedValueOnce({ rows });

    const result = await promotionRepository.findAll({ statuses: ['scheduled', 'active'] });

    expect(result).toEqual(rows);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('status = ANY($1'));
    expect(params).toEqual([['scheduled', 'active']]);
  });
});

describe('promotionRepository.findById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('존재하면 promotion과 prizes를 합쳐 반환한다', async () => {
    const promotion = { id: 1, title: 'A' };
    const prizes = [{ id: 1, promotion_id: 1, name: '1등' }];

    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [promotion] });
      }
      if (sql.includes('FROM prizes') && sql.includes('WHERE promotion_id')) {
        return Promise.resolve({ rows: prizes });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await promotionRepository.findById(1);

    expect(result).toEqual({ ...promotion, prizes });
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it('존재하지 않으면 undefined를 반환하고 prizes 조회를 하지 않는다', async () => {
    pool.query.mockImplementation((sql) => {
      if (sql.includes('FROM promotions') && sql.includes('WHERE id')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await promotionRepository.findById(999);

    expect(result).toBeUndefined();
    expect(pool.query).toHaveBeenCalledTimes(1);
    const calledPrizes = pool.query.mock.calls.some(([sql]) => sql.includes('FROM prizes'));
    expect(calledPrizes).toBe(false);
  });
});

describe('promotionRepository.create', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('scheduled 상태로 promotion을 생성하고 RETURNING 결과를 반환한다', async () => {
    const created = { id: 1, title: 'A', status: 'scheduled' };
    pool.query.mockResolvedValueOnce({ rows: [created] });

    const result = await promotionRepository.create({
      type: 'draw',
      title: 'A',
      description: 'desc',
      hasGame: true,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    expect(result).toEqual(created);
    const [sql] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('INSERT INTO promotions'));
    expect(sql).toEqual(expect.stringContaining("'scheduled'"));
    expect(sql).toEqual(expect.stringContaining('RETURNING'));
  });
});

describe('promotionRepository.update', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('promotion을 수정하고 RETURNING 결과를 반환한다', async () => {
    const updated = { id: 1, title: 'B' };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const result = await promotionRepository.update(1, {
      type: 'draw',
      title: 'B',
      description: 'desc2',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });

    expect(result).toEqual(updated);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('UPDATE promotions SET'));
    expect(sql).toEqual(expect.stringContaining('WHERE id = $1'));
    expect(sql).toEqual(expect.stringContaining('RETURNING'));
    expect(params[0]).toBe(1);
  });
});

describe('promotionRepository.updateStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('status만 변경하고 RETURNING 결과를 반환한다', async () => {
    const updated = { id: 1, status: 'active' };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const result = await promotionRepository.updateStatus(1, 'active');

    expect(result).toEqual(updated);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('UPDATE promotions SET status = $2'));
    expect(sql).toEqual(expect.stringContaining('WHERE id = $1'));
    expect(sql).toEqual(expect.stringContaining('RETURNING'));
    expect(params).toEqual([1, 'active']);
  });
});

describe('아키텍처 규칙: 상위 계층 import 금지', () => {
  it('services 또는 controllers를 require하지 않는다', () => {
    const source = fs.readFileSync(path.join(__dirname, 'promotionRepository.js'), 'utf-8');

    expect(source).not.toMatch(/require\(['"]\.\.\/services/);
    expect(source).not.toMatch(/require\(['"]\.\.\/controllers/);
  });
});
