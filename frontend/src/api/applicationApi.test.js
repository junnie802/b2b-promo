import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client.js', () => {
  return { default: { post: vi.fn(), get: vi.fn(), patch: vi.fn() } };
});

import client from './client.js';
import {
  applyToPromotion,
  listMyApplications,
  cancelApplication,
  listPromotionApplicants,
} from './applicationApi.js';

beforeEach(() => {
  client.post.mockReset();
  client.get.mockReset();
  client.patch.mockReset();
});

describe('applyToPromotion', () => {
  it('id로 client.post를 호출한다', async () => {
    client.post.mockResolvedValueOnce({ data: {} });

    await applyToPromotion(5);

    expect(client.post).toHaveBeenCalledWith('/api/promotions/5/applications');
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 1 };
    client.post.mockResolvedValueOnce({ data });

    const result = await applyToPromotion(5);

    expect(result).toEqual(data);
  });
});

describe('listMyApplications', () => {
  it('client.get을 호출한다', async () => {
    client.get.mockResolvedValueOnce({ data: [] });

    await listMyApplications();

    expect(client.get).toHaveBeenCalledWith('/api/applications/me');
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = [{ id: 1 }];
    client.get.mockResolvedValueOnce({ data });

    const result = await listMyApplications();

    expect(result).toEqual(data);
  });
});

describe('cancelApplication', () => {
  it('applicationId로 client.patch를 호출한다', async () => {
    client.patch.mockResolvedValueOnce({ data: {} });

    await cancelApplication(7);

    expect(client.patch).toHaveBeenCalledWith('/api/applications/7/cancel');
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 7, status: 'cancelled' };
    client.patch.mockResolvedValueOnce({ data });

    const result = await cancelApplication(7);

    expect(result).toEqual(data);
  });
});

describe('listPromotionApplicants', () => {
  it('promotionId로 client.get을 호출한다', async () => {
    client.get.mockResolvedValueOnce({ data: [] });

    await listPromotionApplicants(5);

    expect(client.get).toHaveBeenCalledWith('/api/promotions/5/applications');
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = [{ id: 1, status: 'applied' }];
    client.get.mockResolvedValueOnce({ data });

    const result = await listPromotionApplicants(5);

    expect(result).toEqual(data);
  });
});
