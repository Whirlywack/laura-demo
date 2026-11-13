/** A single line with one number in it. */
export interface StatLineProps {
  /** Text before the number, e.g. "Tablets confirmed on the call:" */
  label?: string;
  /** The number, e.g. "39 of 42". */
  value: string;
  /** Text after, e.g. "in the last two weeks". */
  suffix?: string;
  style?: React.CSSProperties;
}
export function StatLine(props: StatLineProps): JSX.Element;
