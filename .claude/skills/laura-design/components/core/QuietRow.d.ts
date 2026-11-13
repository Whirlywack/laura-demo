import * as React from 'react';

/** Folded, read-only block for background information such as the care plan or history. */
export interface QuietRowProps {
  title: string;
  /** One line under the title; may contain a StatLine. */
  note?: React.ReactNode;
  /** Label of the unfold link. */
  action?: string;
  open?: boolean;
  onToggle?: () => void;
  /** Shown when open, e.g. KeyValueRows. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function QuietRow(props: QuietRowProps): JSX.Element;

export interface KeyValueRowsProps {
  rows: { label: string; value: React.ReactNode }[];
}
/** Plain two-column rows for read-only facts. */
export function KeyValueRows(props: KeyValueRowsProps): JSX.Element;
