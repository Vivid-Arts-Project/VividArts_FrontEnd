import Icon from './Icon';
import { STATUS_MAP } from './statusConfig';

export default function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.in_queue;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-[3px] rounded-full whitespace-nowrap ${s.cls}`}>
      <Icon name={s.icon} size={13}/>
      <span>{s.label}</span>
    </span>
  );
}
