import db from "#db/client";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  try {
    // Clear old data to avoid duplicates
    await db.query("DELETE FROM playlists_tracks");
    await db.query("DELETE FROM playlists");
    await db.query("DELETE FROM tracks");
    await db.query("DELETE FROM users");

    console.log("🗑️ Old data cleared");

    // ------------------ Seed Users ------------------
    const users = [];
    for (let u = 1; u <= 2; u++) {
      const user = await createUser({
        username: `user${u}`,
        password: `password${u}`, 
      });
      users.push(user);
    }
    console.log("👤 Users seeded");

    // ------------------ Seed Tracks ------------------
    const tracks = [];
    for (let i = 1; i <= 20; i++) {
      const track = await createTrack({
        name: "Track " + i,
        durationMs: 180000 + i * 1000,
      });
      tracks.push(track);
    }
    console.log("🎵 Tracks seeded");

    // ------------------ Seed Playlists ------------------
    const playlists = [];
    for (let j = 1; j <= 10; j++) {
      // randomly assign this playlist to one of the seeded users
      const user = users[Math.floor(Math.random() * users.length)];
      const playlist = await createPlaylist({
        name: "Playlist " + j,
        description: "Description " + j,
        user_id: user.id, 
      });
      playlists.push(playlist);
    }
    console.log("📀 Playlists seeded");

    // ------------------ Seed Playlist-Tracks ------------------

    for (const user of users) {
      const userPlaylists = playlists.filter((p) => p.user_id === user.id);

      if (userPlaylists.length > 0) {
        const firstPlaylist = userPlaylists[0];
      
        const sampleTracks = [...tracks]
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        for (const track of sampleTracks) {
          await createPlaylistTrack({
            playlist_id: firstPlaylist.id,
            track_id: track.id,
          });
        }
        console.log(
          `📌 Ensured ${user.username}'s playlist "${firstPlaylist.name}" has 5 tracks`
        );
      }
    }

    // // Add some extra random playlist-track associations for variety
    // for (let k = 1; k <= 15; k++) {
    //   const playlist = playlists[Math.floor(Math.random() * playlists.length)];
    //   const track = tracks[Math.floor(Math.random() * tracks.length)];
    //   await createPlaylistTrack({
    //     playlist_id: playlist.id,
    //     track_id: track.id,
    //   });
    // }
    console.log("🔗 Playlist-Tracks seeded");

    console.log("🔗 Playlist-Tracks associations seeded");
    console.log("🌱 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.end();
  }
}
