import type { ReactNode } from 'react';

export interface StatusPillProps {
  /** Order status. Drives color + default label. Default 'pending'. */
  status?: 'pending' | 'accepted' | 'progress' | 'completed' | 'rejected';
  /** Override the default label text. */
  children?: ReactNode;
}

/** Order/booking status chip — soft tinted background + matching text. */
export function StatusPill(props: StatusPillProps): JSX.Element;
