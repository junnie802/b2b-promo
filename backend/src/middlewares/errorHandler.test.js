const errorHandler = require('./errorHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it.each([400, 401, 403, 404])('err.statusCode=%i 이면 해당 상태코드와 { error: message }를 응답한다', (statusCode) => {
    const err = new Error(`error ${statusCode}`);
    err.statusCode = statusCode;
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.json).toHaveBeenCalledWith({ error: err.message });
  });

  it('statusCode가 없으면 500을 기본값으로 응답한다', () => {
    const err = new Error('unexpected');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'unexpected' });
  });
});
