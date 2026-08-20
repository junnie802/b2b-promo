jest.mock('../repositories/promotionRepository');
jest.mock('../repositories/prizeRepository');

const promotionRepository = require('../repositories/promotionRepository');
const promotionService = require('./promotionService');

describe('promotionService.changeStatus - EX-3: 경품 없는 게임 프로모션 게시 거부', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has_game=true, prizes=[]인 프로모션을 publish하면 400을 반환한다', async () => {
    promotionRepository.findById.mockResolvedValue({
      id: 1,
      status: 'scheduled',
      has_game: true,
      prizes: [],
    });

    await expect(promotionService.changeStatus(1, 'publish')).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('경품'),
    });
    expect(promotionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('has_game=true이고 경품이 있으면 정상적으로 게시(active)된다', async () => {
    promotionRepository.findById.mockResolvedValue({
      id: 1,
      status: 'scheduled',
      has_game: true,
      prizes: [{ id: 10, name: '1등' }],
    });
    promotionRepository.updateStatus.mockResolvedValue({ id: 1, status: 'active' });

    const result = await promotionService.changeStatus(1, 'publish');

    expect(promotionRepository.updateStatus).toHaveBeenCalledWith(1, 'active');
    expect(result.status).toBe('active');
  });

  it('has_game=false면 경품 없이도 정상적으로 게시된다', async () => {
    promotionRepository.findById.mockResolvedValue({
      id: 1,
      status: 'scheduled',
      has_game: false,
      prizes: [],
    });
    promotionRepository.updateStatus.mockResolvedValue({ id: 1, status: 'active' });

    const result = await promotionService.changeStatus(1, 'publish');

    expect(promotionRepository.updateStatus).toHaveBeenCalledWith(1, 'active');
    expect(result.status).toBe('active');
  });
});
