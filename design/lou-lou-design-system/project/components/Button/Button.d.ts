import type { ReactNode } from 'react';

export interface ButtonProps {
  /** Button label / contents */
  children?: ReactNode;
  /** Visual style. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Height/padding scale. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the container width */
  block?: boolean;
  disabled?: boolean;
  /** Show an inline spinner and block interaction */
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

/** Lou Lou pill CTA — dark-ink primary, hairline secondary, quiet ghost. */
export function Button(props: ButtonProps): JSX.Element;
