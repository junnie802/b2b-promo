import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client.js', () => {
  return { default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() } };
});

import client from './client.js';
import {
  listPromotions,
  getPromotionDetail,
  changePromotionStatus,
  createPromotion,
  updatePromotion,
} from './promotionApi.js';

beforeEach(() => {
  client.get.mockReset();
  client.patch.mockReset();
  client.post.mockReset();
});

describe('listPromotions', () => {
  it('status를 넘기면 params에 status를 담아 client.get을 호출한다', async () => {
    client.get.mockResolvedValueOnce({ data: [] });

    await listPromotions({ status: 'active' });

    expect(client.get).toHaveBeenCalledWith('/api/promotions', {
      params: { status: 'active' },
    });
  });

  it('status를 넘기지 않으면 빈 params로 client.get을 호출한다', async () => {
    client.get.mockResolvedValueOnce({ data: [] });

    await listPromotions();

    expect(client.get).toHaveBeenCalledWith('/api/promotions', { params: {} });
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = [{ id: 1 }];
    client.get.mockResolvedValueOnce({ data });

    const result = await listPromotions({ status: 'active' });

    expect(result).toEqual(data);
  });
});

describe('getPromotionDetail', () => {
  it('id로 client.get을 호출한다', async () => {
    client.get.mockResolvedValueOnce({ data: {} });

    await getPromotionDetail(5);

    expect(client.get).toHaveBeenCalledWith('/api/promotions/5');
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 5 };
    client.get.mockResolvedValueOnce({ data });

    const result = await getPromotionDetail(5);

    expect(result).toEqual(data);
  });
});

describe('changePromotionStatus', () => {
  it("action이 'publish'이면 client.patch를 해당 action으로 호출한다", async () => {
    client.patch.mockResolvedValueOnce({ data: {} });

    await changePromotionStatus(5, 'publish');

    expect(client.patch).toHaveBeenCalledWith('/api/promotions/5/status', {
      action: 'publish',
    });
  });

  it("action이 'end'이면 client.patch를 해당 action으로 호출한다", async () => {
    client.patch.mockResolvedValueOnce({ data: {} });

    await changePromotionStatus(5, 'end');

    expect(client.patch).toHaveBeenCalledWith('/api/promotions/5/status', {
      action: 'end',
    });
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 5, status: 'published' };
    client.patch.mockResolvedValueOnce({ data });

    const result = await changePromotionStatus(5, 'publish');

    expect(result).toEqual(data);
  });
});

describe('createPromotion', () => {
  it('payload로 client.post를 호출한다', async () => {
    client.post.mockResolvedValueOnce({ data: {} });

    await createPromotion({ title: 'A' });

    expect(client.post).toHaveBeenCalledWith('/api/promotions', { title: 'A' });
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 1, title: 'A' };
    client.post.mockResolvedValueOnce({ data });

    const result = await createPromotion({ title: 'A' });

    expect(result).toEqual(data);
  });
});

describe('updatePromotion', () => {
  it('id와 payload로 client.patch를 호출한다', async () => {
    client.patch.mockResolvedValueOnce({ data: {} });

    await updatePromotion(5, { title: 'B' });

    expect(client.patch).toHaveBeenCalledWith('/api/promotions/5', { title: 'B' });
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 5, title: 'B' };
    client.patch.mockResolvedValueOnce({ data });

    const result = await updatePromotion(5, { title: 'B' });

    expect(result).toEqual(data);
  });
});
