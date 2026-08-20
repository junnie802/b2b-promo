import { Link } from 'react-router-dom';
import { usePromotionListQuery, useChangePromotionStatusMutation } from '../../../hooks/usePromotions';
import Badge from '../../../components/common/Badge';

function PromotionAdminListPage() {
  const { data, isLoading, isError } = usePromotionListQuery();
  const statusMutation = useChangePromotionStatusMutation();

  return (
    <div className="promotion-list-page">
      <h1>프로모션 관리</h1>
      <Link to="/admin/promotions/new" className="btn-primary">
        + 신규 등록
      </Link>

      {isLoading && <p className="list-status-message">불러오는 중입니다...</p>}
      {isError && <p className="list-status-message">목록을 불러오지 못했습니다</p>}
      {!isLoading && !isError && data?.length === 0 && (
        <p className="list-status-message">등록된 프로모션이 없습니다</p>
      )}
      {!isLoading && !isError && data?.length > 0 && (
        <div className="my-applications-table-wrapper">
          <table className="my-applications-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>유형</th>
                <th>게임</th>
                <th>상태</th>
                <th>기간</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>
                    <Badge kind="type" value={p.type} />
                  </td>
                  <td>{p.has_game ? 'O' : 'X'}</td>
                  <td>
                    <Badge kind="status" value={p.status} />
                  </td>
                  <td>
                    {p.start_date} ~ {p.end_date}
                  </td>
                  <td>
                    <div className="admin-list-actions">
                      <Link to={`/admin/promotions/${p.id}/edit`}>수정</Link>
                      {p.status === 'scheduled' && (
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => statusMutation.mutate({ id: p.id, action: 'publish' })}
                        >
                          게시
                        </button>
                      )}
                      {p.status === 'active' && (
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => statusMutation.mutate({ id: p.id, action: 'end' })}
                        >
                          종료
                        </button>
                      )}
                      <Link to={`/admin/promotions/${p.id}/applicants`}>참여현황</Link>
                    </div>
                    {statusMutation.isError && statusMutation.variables?.id === p.id && (
                      <p className="apply-error-message">{statusMutation.error?.response?.data?.error}</p>
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

export default PromotionAdminListPage;
