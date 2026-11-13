export interface DatedListItem {
  /** e.g. "Thu 12 Nov" */
  date: string;
  /** A reading, shown right-aligned on the same line. */
  value?: string;
  /** A remark, shown under the date in her words. */
  quote?: string;
}
/** Earlier readings or remarks, newest first. */
export interface DatedListProps {
  items: DatedListItem[];
  style?: React.CSSProperties;
}
export function DatedList(props: DatedListProps): JSX.Element;
