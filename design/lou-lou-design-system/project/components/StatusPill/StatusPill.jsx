// Lou Lou — StatusPill
// Order/booking status chip. Soft tinted background + matching text.

export function StatusPill({ status = 'pending', children }) {
  const map = {
    pending:   { bg: '#FEF3C7', fg: '#B45309', label: '待确认' },
    accepted:  { bg: '#E6F1EC', fg: '#2C7A4B', label: '待付款' },
    progress:  { bg: '#E3EEF7', fg: '#2F5F87', label: '待完成' },
    completed: { bg: '#F0F0F5', fg: '#6B6B7A', label: '已完成' },
    rejected:  { bg: '#FFF0F0', fg: '#CC2200', label: '已失效' },
  };
  const s = map[status] || map.pending;
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 700, lineHeight: 1,
      padding: '4px 9px',
      borderRadius: 'var(--ll-radius-pill)',
      background: s.bg, color: s.fg,
      fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
    },
  }, children || s.label);
}
