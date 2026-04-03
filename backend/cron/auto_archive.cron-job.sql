-- first unschedule in case job already exists
SELECT cron.unschedule('nightly-archive-records');

-- schedule archive job (run every day at midnight)
SELECT cron.schedule('nightly-archive-records', '0 0 * * *', $CRON$ SELECT archive_on_date_passed(); $CRON$);
