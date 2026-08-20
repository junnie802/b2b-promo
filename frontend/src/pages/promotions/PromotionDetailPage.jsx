import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import RouletteModal from '../../components/promotion/RouletteModal';
import { getApplyBlockedMessage } from '../../components/promotion/applicationMessages';
import { usePromotionDetailQuery } from '../../hooks/usePromotions';
import { useApplyMutation } from '../../hooks/useApplications';
import { loadAppliedPrize, saveAppliedPrize } from '../../utils/appliedPrizeStorage';

function PromotionDetailPage() {
  const { id } = useParams();
  const { data: promotion, isLoading, isError } = usePromotionDetailQuery(id);
  const applyMutation = useApplyMutation(id);
  const [showModal, setShowModal] = useState(false);
  const [revealedPrize, setRevealedPrize] = useState(null);

  useEffect(() => {
    if (promotion?.has_game) {
      setRevealedPrize((current) => current ?? loadAppliedPrize(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotion?.has_game, id]);

  if (isLoading) return <p className="list-status-message">불러오는 중입니다...</p>;
  if (isError || !promotion) {
    return <p className="list-status-message">정보를 불러오지 못했습니다</p>;
  }

  const blockedMessage = getApplyBlockedMessage(promotion.status);
  const isApplied = applyMutation.isSuccess || Boolean(revealedPrize);

  return (
    <div className="promotion-detail">
      <div className="promotion-detail-header">
        <div className="promotion-card-badges">
          <Badge kind="status" value={promotion.status} />
          <Badge kind="type" value={promotion.type} />
          {promotion.has_game && <span className="badge-game">[게임]</span>}
        </div>
        <h1>{promotion.title}</h1>
        <div className="promotion-card-period">
          {promotion.start_date} ~ {promotion.end_date}
        </div>
      </div>

      <p className="promotion-detail-description">{promotion.description}</p>

      {promotion.has_game && (
        <div className="promotion-game-box">
          <p>🎯 게임 적용 프로모션 — 참여 신청 시 룰렛 추첨으로 경품이 확정됩니다.</p>
          {promotion.prizes?.length > 0 && (
            <ul className="promotion-prize-list">
              {promotion.prizes.map((prize) => (
                <li key={prize.id}>{prize.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="apply-section">
        {blockedMessage && (
          <>
            <button type="button" className="btn-primary" disabled>
              참여 신청하기
            </button>
            <p className="apply-blocked-message">{blockedMessage}</p>
          </>
        )}

        {!blockedMessage && isApplied && (
          <>
            <button type="button" className="btn-primary" disabled>
              신청 완료
            </button>
            {promotion.has_game && revealedPrize?.prizeName && (
              <p className="apply-success-message">당첨 경품: {revealedPrize.prizeName}</p>
            )}
          </>
        )}

        {!blockedMessage && !isApplied && (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                applyMutation.mutate(undefined, {
                  onSuccess: (data) => {
                    if (promotion.has_game && data.prize_name) {
                      saveAppliedPrize(id, { prizeName: data.prize_name });
                      setRevealedPrize({ prizeName: data.prize_name });
                      setShowModal(true);
                    }
                  },
                })
              }
            >
              참여 신청하기
            </button>
            {applyMutation.isError && (
              <p className="apply-error-message">{applyMutation.error?.response?.data?.error}</p>
            )}
          </>
        )}
      </div>

      {showModal && (
        <RouletteModal prizeName={revealedPrize?.prizeName} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default PromotionDetailPage;
