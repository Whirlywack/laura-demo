import * as React from 'react';

/** Rounded surface. Every block on a Laura page sits in one of these. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** card = cream; quiet = sage tint (feed, background info); action = chamomile (the one thing to do); live = sage (her side: the phone block, the story block). */
  tone?: 'card' | 'quiet' | 'action' | 'live';
  /** Smaller radius and padding, for folded rows. */
  compact?: boolean;
  children?: React.ReactNode;
}
export function Card(props: CardProps): JSX.Element;
