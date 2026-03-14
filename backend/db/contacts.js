const { query } = require("./pool");

async function listContacts({ ownerUserId, limit, offset }) {
  const itemsRes = await query(
    `select
       id as "_id",
       owner_user_id as "ownerUserId",
       name,
       phone,
       company,
       notes,
       created_at as "createdAt",
       updated_at as "updatedAt"
     from contacts
     where owner_user_id = $1
     order by created_at desc
     limit $2 offset $3`,
    [ownerUserId, limit, offset],
  );
  const totalRes = await query("select count(*)::int as count from contacts where owner_user_id = $1", [ownerUserId]);
  return { items: itemsRes.rows, total: totalRes.rows[0]?.count || 0 };
}

async function upsertContact({ ownerUserId, name, phone, company, notes }) {
  const res = await query(
    `insert into contacts(owner_user_id, name, phone, company, notes)
     values ($1, $2, $3, $4, $5)
     on conflict(owner_user_id, phone) do update
       set name = excluded.name,
           company = excluded.company,
           notes = excluded.notes,
           updated_at = now()
     returning
       id as "_id",
       owner_user_id as "ownerUserId",
       name,
       phone,
       company,
       notes,
       created_at as "createdAt",
       updated_at as "updatedAt"`,
    [ownerUserId, name || null, phone, company || null, notes || null],
  );
  return res.rows[0];
}

async function deleteContact({ ownerUserId, id }) {
  await query("delete from contacts where id = $1 and owner_user_id = $2", [id, ownerUserId]);
}

async function listLatestContacts({ ownerUserId, limit }) {
  const res = await query(
    `select
       id as "_id",
       owner_user_id as "ownerUserId",
       name,
       phone,
       company,
       notes,
       created_at as "createdAt",
       updated_at as "updatedAt"
     from contacts
     where owner_user_id = $1
     order by created_at desc
     limit $2`,
    [ownerUserId, limit],
  );
  return res.rows;
}

async function bulkUpsertContacts({ ownerUserId, rows }) {
  if (!rows.length) return { imported: 0, updated: 0, total: 0 };

  const phones = rows.map((r) => r.phone);
  const existingRes = await query(
    "select phone from contacts where owner_user_id = $1 and phone = any($2::text[])",
    [ownerUserId, phones],
  );
  const existingCount = existingRes.rows.length;

  const names = rows.map((r) => r.name || null);
  const companies = rows.map((r) => r.company || null);
  const notes = rows.map((r) => r.notes || null);

  await query(
    `insert into contacts(owner_user_id, name, phone, company, notes)
     select $1, x.name, x.phone, x.company, x.notes
     from unnest($2::text[], $3::text[], $4::text[], $5::text[]) as x(name, phone, company, notes)
     on conflict(owner_user_id, phone) do update
       set name = excluded.name,
           company = excluded.company,
           notes = excluded.notes,
           updated_at = now()`,
    [ownerUserId, names, phones, companies, notes],
  );

  const total = rows.length;
  return { imported: total - existingCount, updated: existingCount, total };
}

module.exports = { listContacts, upsertContact, deleteContact, bulkUpsertContacts, listLatestContacts };
