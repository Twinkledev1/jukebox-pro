import db from "#db/client";

export async function createPlaylistTrack({ playlist_id, track_id }) {
  const sql = `
  INSERT INTO playlists_tracks
    (playlist_id, track_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [playlistTrack],
  } = await db.query(sql, [playlist_id, track_id]);
  return playlistTrack;
}
