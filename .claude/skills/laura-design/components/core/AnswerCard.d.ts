import * as React from 'react';

/**
 * One of the carer's questions with its answer in large type. The top row of the dashboard is three of these.
 * @startingPoint section="Dashboard" subtitle="Question plus big answer" viewport="700x420"
 */
export interface AnswerCardProps {
  /** The carer's question in their own words, e.g. "Is she okay today?" */
  question: string;
  /** Her quote, or a short fact such as "3 of 4". */
  answer: React.ReactNode;
  /** action = straw, for the single thing the carer must do. */
  tone?: 'card' | 'action';
  /** Keep short numeric answers ("3 of 4") on one line. Do not use for word answers; they must be free to wrap. */
  nowrap?: boolean;
  /** Supporting line, bars or a checklist, pinned to the bottom. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function AnswerCard(props: AnswerCardProps): JSX.Element;
