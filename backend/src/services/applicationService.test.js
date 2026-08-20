jest.mock('../repositories/applicationRepository');
jest.mock('./promotionService');

const applicationRepository = require('../repositories/applicationRepository');
const promotionService = require('./promotionService');
const applicationService = require('./applicationService');

function mockActivePromotion(overrides = {}) {
  return { id: 1, status: 'active', has_game: false, prizes: [], ...overrides };
}

describe('applicationService.apply - DB UNIQUE 제약 위반 방어', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create 시 DB UNIQUE 제약 위반(23505)이 발생하면 400과 중복 안내 메시지로 변환한다', async () => {
    promotionService.getById.mockResolvedValue(mockActivePromotion());
    applicationRepository.findByPromotionAndBuyer.mockResolvedValue(undefined);
    const dbErr = new Error('duplicate key value violates unique constraint');
    dbErr.code = '23505';
    applicationRepository.create.mockRejectedValue(dbErr);

    await expect(applicationService.apply(1, 2)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('이미'),
    });
  });

  it('23505가 아닌 다른 DB 에러는 그대로 전파한다', async () => {
    promotionService.getById.mockResolvedValue(mockActivePromotion());
    applicationRepository.findByPromotionAndBuyer.mockResolvedValue(undefined);
    const dbErr = new Error('connection lost');
    applicationRepository.create.mockRejectedValue(dbErr);

    await expect(applicationService.apply(1, 2)).rejects.toThrow('connection lost');
  });
});

describe('applicationService.apply - EX-1: 중복 신청 거부', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('기존 신청이 이미 applied 상태면 create를 호출하지 않고 400을 반환한다', async () => {
    promotionService.getById.mockResolvedValue(mockActivePromotion());
    applicationRepository.findByPromotionAndBuyer.mockResolvedValue({ id: 5, status: 'applied' });

    await expect(applicationService.apply(1, 2)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('이미'),
    });
    expect(applicationRepository.create).not.toHaveBeenCalled();
    expect(applicationRepository.reactivate).not.toHaveBeenCalled();
  });
});

describe('applicationService.apply - 취소 후 재신청(reactivate)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('완료조건1: 기존 신청이 cancelled면 create 대신 reactivate를 호출한다', async () => {
    promotionService.getById.mockResolvedValue(mockActivePromotion({ has_game: false }));
    applicationRepository.findByPromotionAndBuyer.mockResolvedValue({ id: 5, status: 'cancelled' });
    applicationRepository.reactivate.mockResolvedValue({ id: 5, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: null });

    await applicationService.apply(1, 2);

    expect(applicationRepository.create).not.toHaveBeenCalled();
    expect(applicationRepository.reactivate).toHaveBeenCalledWith({ id: 5, prizeId: undefined });
  });

  it('완료조건2: has_game=true면 재추첨 결과로 reactivate를 호출하고 prize_name을 반환한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const prizes = [{ id: 10, name: '1등' }, { id: 11, name: '2등' }];
    promotionService.getById.mockResolvedValue(mockActivePromotion({ has_game: true, prizes }));
    applicationRepository.findByPromotionAndBuyer.mockResolvedValue({ id: 5, status: 'cancelled' });
    applicationRepository.reactivate.mockResolvedValue({ id: 5, promotion_id: 1, buyer_id: 2, status: 'applied', prize_id: 10 });

    const result = await applicationService.apply(1, 2);

    expect(applicationRepository.reactivate).toHaveBeenCalledWith({ id: 5, prizeId: 10 });
    expect(result.prize_name).toBe('1등');
  });

  it('완료조건3: 프로모션이 active가 아니면 재신청도 400을 반환한다', async () => {
    promotionService.getById.mockResolvedValue(mockActivePromotion({ status: 'ended' }));
    applicationRepository.findByPromotionAndBuyer.mockResolvedValue({ id: 5, status: 'cancelled' });

    await expect(applicationService.apply(1, 2)).rejects.toMatchObject({ statusCode: 400 });
    expect(applicationRepository.reactivate).not.toHaveBeenCalled();
  });
});

describe('applicationService.cancel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('신청이 없으면 404를 반환한다', async () => {
    applicationRepository.findById.mockResolvedValue(undefined);

    await expect(applicationService.cancel(999, 2)).rejects.toMatchObject({ statusCode: 404 });
    expect(applicationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('본인 신청이 아니면 404를 반환한다', async () => {
    applicationRepository.findById.mockResolvedValue({ id: 5, buyer_id: 3, status: 'applied' });

    await expect(applicationService.cancel(5, 2)).rejects.toMatchObject({ statusCode: 404 });
    expect(applicationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('이미 cancelled면 400을 반환한다', async () => {
    applicationRepository.findById.mockResolvedValue({ id: 5, buyer_id: 2, status: 'cancelled' });

    await expect(applicationService.cancel(5, 2)).rejects.toMatchObject({ statusCode: 400 });
    expect(applicationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('성공하면 updateStatus(id, cancelled)를 호출하고 결과를 반환한다', async () => {
    applicationRepository.findById.mockResolvedValue({ id: 5, buyer_id: 2, status: 'applied' });
    applicationRepository.updateStatus.mockResolvedValue({ id: 5, buyer_id: 2, status: 'cancelled' });

    const result = await applicationService.cancel(5, 2);

    expect(applicationRepository.updateStatus).toHaveBeenCalledWith(5, 'cancelled');
    expect(result).toEqual({ id: 5, buyer_id: 2, status: 'cancelled' });
  });
});

describe('applicationService.listMine', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findByBuyerId(buyerId) 결과를 그대로 반환한다', async () => {
    const rows = [{ id: 1, promotion_title: '여름 프로모션', promotion_status: 'active', prize_name: '1등' }];
    applicationRepository.findByBuyerId.mockResolvedValue(rows);

    const result = await applicationService.listMine(2);

    expect(applicationRepository.findByBuyerId).toHaveBeenCalledWith(2);
    expect(result).toEqual(rows);
  });

  it('BR-2: 저장된 추첨 결과(prize_id)는 재추첨 없이 그대로 조회된다', async () => {
    const randomSpy = jest.spyOn(Math, 'random');
    const rows = [{ id: 1, promotion_title: '여름 프로모션', promotion_status: 'active', prize_id: 10, prize_name: '1등' }];
    applicationRepository.findByBuyerId.mockResolvedValue(rows);

    const result = await applicationService.listMine(2);

    expect(randomSpy).not.toHaveBeenCalled();
    expect(result).toEqual(rows);
    randomSpy.mockRestore();
  });
});

describe('applicationService.listByPromotion', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findByPromotionId(promotionId) 결과를 그대로 반환한다', async () => {
    const rows = [
      { application_id: 1, buyer_name: '김담당', company_name: '행복식당', status: 'applied', prize_name: '1등' },
      { application_id: 2, buyer_name: '이담당', company_name: '기쁨상사', status: 'cancelled', prize_name: null },
    ];
    applicationRepository.findByPromotionId.mockResolvedValue(rows);

    const result = await applicationService.listByPromotion(1);

    expect(applicationRepository.findByPromotionId).toHaveBeenCalledWith(1);
    expect(result).toEqual(rows);
  });
});
