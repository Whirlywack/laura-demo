-- Calls the sample-data script writes as History. A sample Call is never Today (ADR-0001),
-- so before the first Call the page shows "not called yet" above two weeks of History.
alter table calls add column sample boolean not null default false;
