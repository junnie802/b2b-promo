import { Link } from 'react-router-dom';
import Badge from '../common/Badge';

function PromotionCard({ promotion }) {
  return (
    <Link to={`/promotions/${promotion.id}`} className="promotion-card">
      <div className="promotion-card-badges">
        <Badge kind="status" value={promotion.status} />
        <Badge kind="type" value={promotion.type} />
        {promotion.has_game && <span className="badge-game">[게임]</span>}
      </div>
      <div className="promotion-card-title">{promotion.title}</div>
      <div className="promotion-card-period">
        {promotion.start_date} ~ {promotion.end_date}
      </div>
    </Link>
  );
}

export default PromotionCard;
