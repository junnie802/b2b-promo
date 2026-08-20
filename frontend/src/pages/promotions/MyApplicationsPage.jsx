import { Link } from 'react-router-dom';
import { useMyApplicationsQuery, useCancelApplicationMutation } from '../../hooks/useApplications';
import { getApplicationStatusLabel } from '../../components/promotion/applicationStatusLabels';

function MyApplicationsPage() {
  const { data, isLoading, isError } = useMyApplicationsQuery();
  const cancelMutation = useCancelApplicationMutation();

  function handleCancel(app) {
    if (!window.confirm('신청을 취소하시겠습니까?')) return;
    cancelMutation.mutate({ applicationId: app.id, promotionId: app.promotion_id });
  }

  return (
    <div className="promotion-list-page">
      <h1>내 신청 목록</h1>

      {isLoading && <p className="list-status-message">불러오는 중입니다...</p>}
      {isError && <p className="list-status-message">목록을 불러오지 못했습니다</p>}
      {!isLoading && !isError && data?.length === 0 && (
        <p className="list-status-message">신청 내역이 없습니다</p>
      )}
      {!isLoading && !isError && data?.length > 0 && (
        <div className="my-applications-table-wrapper">
          <table className="my-applications-table">
            <thead>
              <tr>
                <th>프로모션명</th>
                <th>상태</th>
                <th>당첨 결과</th>
                <th>신청일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link to={`/promotions/${app.promotion_id}`}>{app.promotion_title}</Link>
                  </td>
                  <td>{getApplicationStatusLabel(app.status)}</td>
                  <td>{app.prize_name ?? '-'}</td>
                  <td>{app.created_at?.slice(0, 10)}</td>
                  <td>
                    {app.status === 'applied' && (
                      <button type="button" className="btn-cancel" onClick={() => handleCancel(app)}>
                        취소
                      </button>
                    )}
                    {app.status === 'cancelled' && (
                      <Link to={`/promotions/${app.promotion_id}`}>재신청</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
