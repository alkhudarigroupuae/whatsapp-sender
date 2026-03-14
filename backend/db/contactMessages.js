const { query } = require("./pool");

async function createContactMessage({ name, email, message, ip, userAgent }) {
  const res = await query(
    `insert into contact_messages(name, email, message, ip, user_agent)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [name, email, message, ip || null, userAgent || null],
  );
  return res.rows[0];
}

module.exports = { createContactMessage };

