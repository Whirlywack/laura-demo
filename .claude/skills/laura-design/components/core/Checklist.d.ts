export interface ChecklistItem {
  label: string;
  /** What she said when she asked for it. */
  quote?: string;
  /** "Just now", or the day it was added. */
  meta?: string;
  /** Added on the current call; meta is shown bold. */
  isNew?: boolean;
  done?: boolean;
}
/** Errands she is running out of, each with a tick box. */
export interface ChecklistProps {
  items: ChecklistItem[];
  onToggle?: (index: number) => void;
  /** True when placed on a chamomile (action) card; uses the darker rule. */
  onHighlight?: boolean;
  style?: React.CSSProperties;
}
export function Checklist(props: ChecklistProps): JSX.Element;
