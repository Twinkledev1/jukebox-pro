import db from "#db/client";
import bcrypt from "bcrypt";

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
      // Hash passwords before storing
      const hashedPassword = await bcrypt.hash(`password${u}`, 10);
      const user = await createUser(`user${u}`, hashedPassword);
      users.push(user);
    }
    console.log("Users seeded");

    // ------------------ Seed Tracks ------------------
    const tracks = [];
    for (let i = 1; i <= 20; i++) {
      const track = await createTrack({
        name: "Track " + i,
        durationMs: 180000 + i * 1000,
      });
      tracks.push(track);
    }
    console.log("Tracks seeded");

    // ------------------ Seed Playlists ------------------
    const playlists = [];
    
    // Create at least one playlist for each user
    for (const user of users) {
      const playlist = await createPlaylist({
        name: `${user.username}'s Playlist`,
        description: `A great playlist by ${user.username}`,
        user_id: user.id,
      });
      playlists.push(playlist);
    }
    
    // Add some additional playlists
    for (let j = 1; j <= 8; j++) {
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
    // Ensure each user has at least one playlist with at least 5 tracks
    for (const user of users) {
      const userPlaylists = playlists.filter((p) => p.user_id === user.id);
      
      if (userPlaylists.length > 0) {
        const firstPlaylist = userPlaylists[0];
        
        // Add exactly 5 random tracks to the first playlist
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
          `📌 Added 5 tracks to ${user.username}'s playlist "${firstPlaylist.name}"`
        );
      }
    }

    // Add some extra random playlist-track associations for variety
    for (let k = 1; k <= 15; k++) {
      try {
        const playlist = playlists[Math.floor(Math.random() * playlists.length)];
        const track = tracks[Math.floor(Math.random() * tracks.length)];
        await createPlaylistTrack({
          playlist_id: playlist.id,
          track_id: track.id,
        });
      } catch (err) {
        // Ignore duplicate errors
        if (err.code !== '23505') throw err;
      }
    }
    console.log("🔗 Playlist-Tracks associations seeded");

    console.log("🌱 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}