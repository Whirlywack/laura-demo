/** One bar per tablet today, in the same vocabulary as StatusLabel. */
export interface DoseBarsProps {
  doses: ('taken' | 'earlier' | 'not-confirmed' | 'not-taken')[];
  style?: React.CSSProperties;
}
export function DoseBars(props: DoseBarsProps): JSX.Element;
