const { query } = require("./pool");

async function getOrCreateRateLimitRow({ key, now }) {
  const res = await query(
    `insert into rate_limits(key, window_start, sent_count)
     values ($1, $2, 0)
     on conflict(key) do update set key = excluded.key
     returning key, window_start as "windowStart", sent_count as "sentCount"`,
    [key, now],
  );
  return res.rows[0];
}

async function resetWindow({ key, now, sentCount }) {
  await query(
    `update rate_limits
     set window_start = $2, sent_count = $3, updated_at = now()
     where key = $1`,
    [key, now, sentCount],
  );
}

async function incrementSent({ key }) {
  await query(
    `update rate_limits
     set sent_count = sent_count + 1, updated_at = now()
     where key = $1`,
    [key],
  );
}

module.exports = { getOrCreateRateLimitRow, resetWindow, incrementSent };

