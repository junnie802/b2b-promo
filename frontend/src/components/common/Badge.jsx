import { getStatusLabel, getTypeLabel } from './badgeLabels';

function Badge({ kind, value }) {
  const label = kind === 'status' ? getStatusLabel(value) : getTypeLabel(value);
  return <span className={`badge badge-${kind}-${value}`}>{label}</span>;
}

export default Badge;
