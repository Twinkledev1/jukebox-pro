import db from "#db/client";

export async function createUser(username, password) {
  const sql = `
  INSERT INTO users
    (username, password)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username, password]);
  return user;
}
