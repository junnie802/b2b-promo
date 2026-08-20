process.env.FRONTEND_ORIGIN = 'http://localhost:5173';

jest.mock('./db/pool', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const pool = require('./db/pool');
const app = require('./app');

describe('GET /health', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('pool.query 성공 시 200과 { status: "ok" }를 반환한다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('pool.query 실패 시 errorHandler를 거쳐 500과 { error }를 반환한다', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await request(app).get('/health');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'DB connection failed' });
  });
});

describe('/api-docs', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
  });

  it('production이 아니면 Swagger UI가 노출된다', async () => {
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    const devApp = require('./app');

    const res = await request(devApp).get('/api-docs/');

    expect(res.status).toBe(200);
  });

  it('production 환경에서는 Swagger UI가 노출되지 않는다', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const prodApp = require('./app');

    const res = await request(prodApp).get('/api-docs/');

    expect(res.status).toBe(404);
  });
});

describe('CORS', () => {
  it('허용 origin이 FRONTEND_ORIGIN 값으로 한정되고 와일드카드가 아니다', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
  });
});
