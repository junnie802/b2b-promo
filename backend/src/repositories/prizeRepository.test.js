jest.mock('../db/pool', () => ({
  query: jest.fn(),
}));

const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');
const prizeRepository = require('./prizeRepository');

describe('prizeRepository.findByPromotionId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('promotion_id로 prizes를 조회해 rows를 반환한다', async () => {
    const rows = [
      { id: 1, promotion_id: 10, name: '1등' },
      { id: 2, promotion_id: 10, name: '2등' },
    ];
    pool.query.mockResolvedValueOnce({ rows });

    const result = await prizeRepository.findByPromotionId(10);

    expect(result).toEqual(rows);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('SELECT'));
    expect(sql).toEqual(expect.stringContaining('FROM prizes'));
    expect(sql).toEqual(expect.stringContaining('WHERE promotion_id = $1'));
    expect(params).toEqual([10]);
  });
});

describe('prizeRepository.createMany', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('여러 상품을 한 번의 멀티로우 INSERT로 생성한다', async () => {
    const returned = [
      { id: 1, promotion_id: 10, name: 'A' },
      { id: 2, promotion_id: 10, name: 'B' },
    ];
    pool.query.mockImplementation((sql) => {
      if (sql.includes('INSERT INTO prizes')) {
        return Promise.resolve({ rows: returned });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await prizeRepository.createMany(10, [{ name: 'A' }, { name: 'B' }]);

    expect(pool.query).toHaveBeenCalledTimes(1);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('INSERT INTO prizes'));
    expect(sql).toEqual(expect.stringContaining('VALUES ($1, $2), ($1, $3)'));
    expect(sql).toEqual(expect.stringContaining('RETURNING'));
    expect(params).toEqual([10, 'A', 'B']);
    expect(result).toEqual(returned);
  });

  it('빈 배열이면 pool.query를 호출하지 않고 빈 배열을 반환한다', async () => {
    const result = await prizeRepository.createMany(10, []);

    expect(pool.query).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

describe('prizeRepository.deleteByPromotionId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('promotion_id로 prizes를 삭제한다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await prizeRepository.deleteByPromotionId(10);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toEqual(expect.stringContaining('DELETE FROM prizes'));
    expect(sql).toEqual(expect.stringContaining('WHERE promotion_id = $1'));
    expect(params).toEqual([10]);
  });
});

describe('아키텍처 규칙: 상위 계층 import 금지', () => {
  it('services 또는 controllers를 require하지 않는다', () => {
    const source = fs.readFileSync(path.join(__dirname, 'prizeRepository.js'), 'utf-8');

    expect(source).not.toMatch(/require\(['"]\.\.\/services/);
    expect(source).not.toMatch(/require\(['"]\.\.\/controllers/);
  });
});
