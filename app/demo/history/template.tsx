import type { ReactNode } from "react";

// Moving between the History page and a day (or from one day to the next) fades the new page in, under the header.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="laura-fade">{children}</div>;
}
