/** Tablet status: a round marker plus words. Never colour alone. */
export interface StatusLabelProps {
  status?: 'taken' | 'earlier' | 'not-confirmed' | 'not-taken';
  /** Override the default wording. */
  label?: string;
  style?: React.CSSProperties;
}
export function StatusLabel(props: StatusLabelProps): JSX.Element;
