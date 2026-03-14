const { query } = require("./pool");

async function createMessageLog({ ownerUserId, campaignId, contactId, phone, message, media, status }) {
  const res = await query(
    `insert into message_logs(owner_user_id, campaign_id, contact_id, phone, message, media, status)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning
       id as "_id",
       owner_user_id as "ownerUserId",
       campaign_id as "campaignId",
       contact_id as "contactId",
       phone,
       message,
       media,
       status,
       attempt_count as "attemptCount",
       error,
       sent_at as "sentAt",
       created_at as "createdAt",
       updated_at as "updatedAt"`,
    [ownerUserId, campaignId, contactId, phone, message, media || null, status],
  );
  return res.rows[0];
}

async function listCampaignLogs({ ownerUserId, campaignId, limit, offset }) {
  const itemsRes = await query(
    `select
       id as "_id",
       owner_user_id as "ownerUserId",
       campaign_id as "campaignId",
       contact_id as "contactId",
       phone,
       message,
       media,
       status,
       attempt_count as "attemptCount",
       error,
       sent_at as "sentAt",
       created_at as "createdAt",
       updated_at as "updatedAt"
     from message_logs
     where owner_user_id = $1 and campaign_id = $2
     order by created_at desc
     limit $3 offset $4`,
    [ownerUserId, campaignId, limit, offset],
  );
  const totalRes = await query(
    "select count(*)::int as count from message_logs where owner_user_id = $1 and campaign_id = $2",
    [ownerUserId, campaignId],
  );
  return { items: itemsRes.rows, total: totalRes.rows[0]?.count || 0 };
}

async function countCampaignLogsByStatus({ ownerUserId, campaignId }) {
  const res = await query(
    `select
       sum(case when status = 'sent' then 1 else 0 end)::int as sent,
       sum(case when status = 'failed' then 1 else 0 end)::int as failed,
       sum(case when status in ('queued','retrying') then 1 else 0 end)::int as queued
     from message_logs
     where owner_user_id = $1 and campaign_id = $2`,
    [ownerUserId, campaignId],
  );
  return res.rows[0] || { sent: 0, failed: 0, queued: 0 };
}

async function updateLogAfterSend({ logId, ownerUserId, status, sentAt, attemptCount, error }) {
  await query(
    `update message_logs
     set status = $3,
         sent_at = $4,
         attempt_count = $5,
         error = $6,
         updated_at = now()
     where id = $1 and owner_user_id = $2`,
    [logId, ownerUserId, status, sentAt || null, attemptCount, error || null],
  );
}

async function markLogRetrying({ logId, ownerUserId, attemptCount, error }) {
  await query(
    `update message_logs
     set status = 'retrying',
         attempt_count = $3,
         error = $4,
         updated_at = now()
     where id = $1 and owner_user_id = $2`,
    [logId, ownerUserId, attemptCount, error || null],
  );
}

async function markLogFailed({ logId, ownerUserId, attemptCount, error }) {
  await query(
    `update message_logs
     set status = 'failed',
         attempt_count = $3,
         error = $4,
         updated_at = now()
     where id = $1 and owner_user_id = $2`,
    [logId, ownerUserId, attemptCount, error || null],
  );
}

module.exports = {
  createMessageLog,
  listCampaignLogs,
  countCampaignLogsByStatus,
  updateLogAfterSend,
  markLogRetrying,
  markLogFailed,
};
