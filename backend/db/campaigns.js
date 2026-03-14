const { query } = require("./pool");

async function listCampaigns({ ownerUserId, limit }) {
  const res = await query(
    `select
       id as "_id",
       owner_user_id as "ownerUserId",
       campaign_idea as "campaignIdea",
       product_description as "productDescription",
       promotion_details as "promotionDetails",
       campaign_description as "campaignDescription",
       media,
       status,
       created_at as "createdAt",
       updated_at as "updatedAt"
     from campaigns
     where owner_user_id = $1
     order by created_at desc
     limit $2`,
    [ownerUserId, limit],
  );
  return res.rows;
}

async function getCampaign({ ownerUserId, id }) {
  const res = await query(
    `select
       id as "_id",
       owner_user_id as "ownerUserId",
       campaign_idea as "campaignIdea",
       product_description as "productDescription",
       promotion_details as "promotionDetails",
       campaign_description as "campaignDescription",
       media,
       status,
       created_at as "createdAt",
       updated_at as "updatedAt"
     from campaigns
     where id = $1 and owner_user_id = $2
     limit 1`,
    [id, ownerUserId],
  );
  return res.rows[0] || null;
}

async function createCampaign({
  ownerUserId,
  campaignIdea,
  productDescription,
  promotionDetails,
  campaignDescription,
  media,
}) {
  const res = await query(
    `insert into campaigns(
       owner_user_id,
       campaign_idea,
       product_description,
       promotion_details,
       campaign_description,
       media
     )
     values ($1, $2, $3, $4, $5, $6)
     returning
       id as "_id",
       owner_user_id as "ownerUserId",
       campaign_idea as "campaignIdea",
       product_description as "productDescription",
       promotion_details as "promotionDetails",
       campaign_description as "campaignDescription",
       media,
       status,
       created_at as "createdAt",
       updated_at as "updatedAt"`,
    [ownerUserId, campaignIdea, productDescription, promotionDetails, campaignDescription, media || null],
  );
  return res.rows[0];
}

async function setCampaignStatus({ ownerUserId, id, status }) {
  await query(
    `update campaigns set status = $3, updated_at = now()
     where id = $1 and owner_user_id = $2`,
    [id, ownerUserId, status],
  );
}

async function findCampaignByMediaFilename({ ownerUserId, filename }) {
  const res = await query(
    `select
       id as "_id",
       owner_user_id as "ownerUserId",
       media
     from campaigns
     where owner_user_id = $1 and (media->>'filename') = $2
     limit 1`,
    [ownerUserId, filename],
  );
  return res.rows[0] || null;
}

module.exports = { listCampaigns, getCampaign, createCampaign, setCampaignStatus, findCampaignByMediaFilename };
