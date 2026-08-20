import { Link, useParams } from 'react-router-dom';
import { usePromotionDetailQuery } from '../../../hooks/usePromotions';
import { usePromotionApplicantsQuery } from '../../../hooks/useApplications';
import { getApplicationStatusLabel } from '../../../components/promotion/applicationStatusLabels';
import { getTypeLabel, getStatusLabel } from '../../../components/common/badgeLabels';
import { summarizeApplicants } from '../../../utils/applicantSummary';

function PromotionApplicantsPage() {
  const { id } = useParams();
  const { data: promotion, isLoading: isPromotionLoading, isError: isPromotionError } = usePromotionDetailQuery(id);
  const { data: applicants, isLoading: isApplicantsLoading, isError: isApplicantsError } = usePromotionApplicantsQuery(id);

  const isLoading = isPromotionLoading || isApplicantsLoading;
  const isError = isPromotionError || isApplicantsError;

  return (
    <div className="promotion-list-page">
      <Link to="/admin/promotions">← 프로모션 관리로</Link>
      <h1>
        참여 현황
        {promotion && ` - ${promotion.title} (${getTypeLabel(promotion.type)}, ${getStatusLabel(promotion.status)})`}
      </h1>

      {isLoading && <p className="list-status-message">불러오는 중입니다...</p>}
      {!isLoading && isError && <p className="list-status-message">정보를 불러오지 못했습니다</p>}
      {!isLoading && !isError && applicants?.length === 0 && (
        <p className="list-status-message">신청 내역이 없습니다</p>
      )}
      {!isLoading && !isError && applicants?.length > 0 && (
        <>
          <div className="my-applications-table-wrapper">
            <table className="my-applications-table">
              <thead>
                <tr>
                  <th>신청자</th>
                  <th>소속 거래처</th>
                  <th>상태</th>
                  <th>당첨 결과</th>
                  <th>신청일</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.application_id}>
                    <td>{a.buyer_name}</td>
                    <td>{a.company_name}</td>
                    <td>{getApplicationStatusLabel(a.status)}</td>
                    <td>{a.prize_name ?? '-'}</td>
                    <td>{a.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(() => {
            const { total, applied, cancelled } = summarizeApplicants(applicants);
            return (
              <p className="applicants-summary">
                총 신청 건수: {total}건 (신청 {applied}건 / 취소 {cancelled}건)
              </p>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default PromotionApplicantsPage;
