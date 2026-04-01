const { query } = require("./pool");

async function createOtp(phone, code, expiresMinutes = 5) {
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  const res = await query(
    `insert into otp_codes(phone, code, expires_at)
     values ($1, $2, $3)
     returning *`,
    [phone, code, expiresAt.toISOString()],
  );
  return res.rows[0];
}

async function verifyOtp(phone, code) {
  const res = await query(
    `select * from otp_codes
     where phone = $1
       and code = $2
       and verified = false
       and expires_at > now()
     order by created_at desc
     limit 1`,
    [phone, code],
  );
  const row = res.rows[0];
  if (!row) return null;

  await query(`update otp_codes set verified = true where id = $1`, [row.id]);
  return row;
}

async function countRecentOtps(phone, windowMinutes = 10) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  const res = await query(
    `select count(*)::int as cnt from otp_codes
     where phone = $1 and created_at > $2`,
    [phone, since.toISOString()],
  );
  return res.rows[0]?.cnt || 0;
}

module.exports = { createOtp, verifyOtp, countRecentOtps };
