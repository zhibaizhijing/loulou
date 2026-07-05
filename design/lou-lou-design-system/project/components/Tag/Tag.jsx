// Lou Lou — Tag
// Small pastel chip used for pet types, coat, attributes.

export function Tag({ children, tone = 'butter' }) {
  const tones = {
    butter:   'var(--ll-butter)',
    lavender: 'var(--ll-lavender)',
    mint:     'var(--ll-mint)',
    peach:    'var(--ll-peach)',
    neutral:  'var(--ll-bg)',
  };
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center',
      height: 22, padding: '0 8px',
      borderRadius: 'var(--ll-radius-xs)',
      fontSize: 11, fontWeight: 600, lineHeight: 1,
      color: 'var(--ll-text)',
      background: tones[tone] || tones.butter,
      fontFamily: 'var(--font-sans)',
      whiteSpace: 'nowrap',
    },
  }, children);
}
