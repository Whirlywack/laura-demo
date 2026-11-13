import * as React from 'react';

/** A fact with what she actually said about it. Her words are always visible. */
export interface QuoteFactProps {
  /** The fact in bold, e.g. a tablet name or "Sleep". */
  fact: React.ReactNode;
  /** Plain text after the fact, e.g. a dose. */
  detail?: string;
  /** Her words, without quotation marks (they are added). */
  quote?: string;
  /** Right-aligned time or date. Ignored when status is given. */
  meta?: string;
  /** Right-aligned status, usually a StatusLabel. */
  status?: React.ReactNode;
  /** One-line form: "Sleep · “…”". */
  inline?: boolean;
  /** Grey the row, for things not yet confirmed. */
  muted?: boolean;
  style?: React.CSSProperties;
}
export function QuoteFact(props: QuoteFactProps): JSX.Element;
