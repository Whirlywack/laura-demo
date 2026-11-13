/** One line in the live call feed. New items arrive at the top. */
export interface FeedItemProps {
  /** What was recorded, e.g. "Ramipril · Taken on call". */
  title: string;
  /** hh:mm; replaced by "Just now" while isNew. */
  time?: string;
  /** The words spoken. Quotation marks are added for Lidia only. */
  quote?: string;
  speaker?: 'lidia' | 'laura';
  /** The newest item: bold, petrol dot, plays the arrive motion once. */
  isNew?: boolean;
  /** Drop the bottom rule on the final item. */
  last?: boolean;
  style?: React.CSSProperties;
}
export function FeedItem(props: FeedItemProps): JSX.Element;
