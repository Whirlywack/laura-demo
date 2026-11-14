import Link from "next/link";
import { PageTitle, pill } from "../../../components/history/HistoryHeader";

// A date with no Call, or an address that is not a date: said in the History pages' own frame, with the way back.
export default function NotFound() {
  return (
    <PageTitle title="No call on that day" line="Laura has nothing noted for this date. The calendar on the History page shows the days she called." pills="Days">
      <Link href="/demo/history" className="laura-button" style={pill(true)}>All days</Link>
    </PageTitle>
  );
}
