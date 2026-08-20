import { useState } from 'react';
import { usePromotionListQuery } from '../../hooks/usePromotions';
import PromotionCard from '../../components/promotion/PromotionCard';

const TABS = [
  { status: 'active', label: '진행' },
  { status: 'scheduled', label: '예정' },
];

function PromotionListPage() {
  const [status, setStatus] = useState('active');
  const { data, isLoading, isError } = usePromotionListQuery(status);

  return (
    <div className="promotion-list-page">
      <h1>프로모션 목록</h1>
      <div className="promotion-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            className={`promotion-tab${status === tab.status ? ' active' : ''}`}
            onClick={() => setStatus(tab.status)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="list-status-message">불러오는 중입니다...</p>}
      {isError && <p className="list-status-message">목록을 불러오지 못했습니다</p>}
      {!isLoading && !isError && data?.length === 0 && (
        <p className="list-status-message">등록된 프로모션이 없습니다</p>
      )}
      {!isLoading && !isError && data?.length > 0 && (
        <div className="promotion-list">
          {data.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PromotionListPage;
