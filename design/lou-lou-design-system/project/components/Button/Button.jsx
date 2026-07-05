// Lou Lou — Button
// Pill CTA. Dark ink primary, hairline secondary, quiet ghost.
// Token-driven (colors_and_type.css custom properties).

export function Button({
  children,
  variant = 'primary',   // 'primary' | 'secondary' | 'ghost'
  size = 'md',           // 'sm' | 'md' | 'lg'
  block = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
}) {
  const heights = { sm: 36, md: 44, lg: 52 };
  const pads    = { sm: '0 16px', md: '0 24px', lg: '0 28px' };
  const fonts   = { sm: 13, md: 15, lg: 16 };

  const base = {
    display: block ? 'flex' : 'inline-flex',
    width: block ? '100%' : undefined,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    height: heights[size] || heights.md,
    padding: pads[size] || pads.md,
    fontSize: fonts[size] || fonts.md,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--ll-radius-pill)',
    border: 0,
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, transform 120ms ease',
    boxSizing: 'border-box',
  };

  const variants = {
    primary: {
      background: disabled ? 'var(--ll-ink-disabled)' : 'var(--ll-ink)',
      color: 'var(--ll-text-on-ink)',
    },
    secondary: {
      background: 'transparent',
      color: disabled ? 'var(--ll-text-3)' : 'var(--ll-text)',
      boxShadow: 'inset 0 0 0 1.5px var(--ll-border)',
    },
    ghost: {
      background: 'transparent',
      color: disabled ? 'var(--ll-text-3)' : 'var(--ll-text-2)',
    },
  };

  const spinner = React.createElement('span', {
    key: 'spin',
    style: {
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: variant === 'primary' ? '#fff' : 'var(--ll-text)',
      display: 'inline-block',
      animation: 'll-btn-spin 0.8s linear infinite',
    },
  });

  return React.createElement(
    'button',
    {
      type, disabled: disabled || loading, onClick,
      style: { ...base, ...(variants[variant] || variants.primary) },
    },
    loading ? spinner : null,
    children,
  );
}
