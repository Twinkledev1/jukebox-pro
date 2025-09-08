import db from "#db/client";

export async function createPlaylist({name, description, user_id}) {
  const sql = `
  INSERT INTO playlists
    (name, description, user_id)
  VALUES
    ($1, $2, $3)
  RETURNING *
  `;
  const {
    rows: [playlist],
  } = await db.query(sql, [name, description, user_id]);
  return playlist;
}

export async function getPlaylists() {
  const sql = `
  SELECT *
  FROM playlists
  `;
  const { rows: playlists } = await db.query(sql);
  return playlists;
}

export async function getPlaylistById(id) {
  const sql = `
  SELECT *
  FROM playlists
  left join 
  WHERE id = $1;
  `;
  const {
    rows: [playlist],
  } = await db.query(sql, [id]);
  console.log(playlist,"An aaray of playlists")
  return playlist[0];
}
