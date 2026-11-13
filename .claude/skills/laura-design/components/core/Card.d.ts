import * as React from 'react';

/** Rounded surface. Every block on a Laura page sits in one of these. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** card = white; quiet = pale petrol (feed, background info); action = straw (the one thing to do); live = petrol (call in progress). */
  tone?: 'card' | 'quiet' | 'action' | 'live';
  /** Smaller radius and padding, for folded rows. */
  compact?: boolean;
  children?: React.ReactNode;
}
export function Card(props: CardProps): JSX.Element;
