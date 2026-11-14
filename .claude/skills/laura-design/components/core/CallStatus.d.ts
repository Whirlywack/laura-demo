/** The call's state and the primary action, in one place in the header. */
export interface CallStatusProps {
  /** idle = "Not called yet" + Call now button; live = sage-tint pill with a burgundy dot and timer; done = outlined "Called at …". */
  state?: 'idle' | 'live' | 'done';
  /** mm:ss shown while live. */
  elapsed?: string;
  /** Time shown when done, e.g. "09:30". */
  calledAt?: string;
  onCall?: () => void;
  style?: React.CSSProperties;
}
export function CallStatus(props: CallStatusProps): JSX.Element;
