const { query } = require("./pool");

async function getOrCreateUsage({ ownerUserId, periodKey }) {
  const res = await query(
    `insert into usage(owner_user_id, period_key, sent_count)
     values ($1, $2, 0)
     on conflict(owner_user_id, period_key) do update
       set owner_user_id = excluded.owner_user_id
     returning
       owner_user_id as "ownerUserId",
       period_key as "periodKey",
       sent_count as "sentCount"`,
    [ownerUserId, periodKey],
  );
  return res.rows[0];
}

async function incrementUsage({ ownerUserId, periodKey, count }) {
  await query(
    `insert into usage(owner_user_id, period_key, sent_count)
     values ($1, $2, $3)
     on conflict(owner_user_id, period_key) do update
       set sent_count = usage.sent_count + excluded.sent_count,
           updated_at = now()`,
    [ownerUserId, periodKey, count],
  );
}

module.exports = { getOrCreateUsage, incrementUsage };

