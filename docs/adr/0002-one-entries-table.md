# One Entries table for everything Laura records

Every tool call Laura makes writes one row to a single Entries table (Call, kind, Quote, details, time), next to a Calls table and a Care plan table. The live feed is the table itself, and every other area (Today, Medications, Blood pressure, Errands, Pass-ons) is a filtered view of it. We chose this over a table per kind so the webhook has one insert path and the page has one realtime subscription for Entries; a new kind of Entry, such as the left leg question, is a new `kind` value rather than a new table.
