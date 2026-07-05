import type { ReactNode } from 'react';

export interface TagProps {
  children?: ReactNode;
  /** Pastel background. Default 'butter'. */
  tone?: 'butter' | 'lavender' | 'mint' | 'peach' | 'neutral';
}

/** Small pastel chip for pet types, coat, attributes. */
export function Tag(props: TagProps): JSX.Element;
