const crypto = require("crypto");
const { query } = require("./pool");

async function createPasswordReset(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const res = await query(
    `insert into password_resets(user_id, token, expires_at)
     values ($1, $2, $3)
     returning *`,
    [userId, token, expiresAt.toISOString()],
  );
  return res.rows[0];
}

async function findValidReset(token) {
  const res = await query(
    `select * from password_resets
     where token = $1
       and used = false
       and expires_at > now()
     limit 1`,
    [token],
  );
  return res.rows[0] || null;
}

async function markResetUsed(id) {
  await query(`update password_resets set used = true where id = $1`, [id]);
}

module.exports = { createPasswordReset, findValidReset, markResetUsed };
