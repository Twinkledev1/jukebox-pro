import express from "express";
const playlistsRouter = express.Router();
export default playlistsRouter;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylistByUserId,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import getUserFromToken from "#middleware/getUserFromToken";
import requireUser from "#middleware/requireUser";

// Apply authentication middleware to ALL routes
playlistsRouter.use(getUserFromToken);
playlistsRouter.use(requireUser);

// GET /playlists - Get all playlists owned by the user
playlistsRouter.get("/", async (req, res, next) => {
  try {
    const playlists = await getPlaylistByUserId(req.user.id);
    res.send(playlists);
  } catch (err) {
    next(err);
  }
});

// POST /playlists - Create a new playlist owned by the user
playlistsRouter.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).send("Request body requires: name, description");
    }

    const playlist = await createPlaylist({
      name,
      description,
      user_id: req.user.id, // Use the authenticated user's ID
    });
    res.status(201).send(playlist);
  } catch (err) {
    next(err);
  }
});

// Middleware to check playlist ownership
playlistsRouter.param("id", async (req, res, next, id) => {
  try {
    const playlist = await getPlaylistById(id);
    if (!playlist) return res.status(404).send("Playlist not found.");

    // Check if the user owns this playlist
    if (playlist.user_id !== req.user.id) {
      return res.status(403).send("Forbidden: You don't own this playlist.");
    }

    req.playlist = playlist;
    next();
  } catch (err) {
    next(err);
  }
});

// GET /playlists/:id - Get a specific playlist (only if owned by user)
playlistsRouter.get("/:id", async (req, res) => {
  res.send(req.playlist);
});

// GET /playlists/:id/tracks - Get tracks in a playlist (only if owned by user)
playlistsRouter.get("/:id/tracks", async (req, res, next) => {
  try {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

// POST /playlists/:id/tracks - Add a track to a playlist (only if owned by user)
playlistsRouter.post("/:id/tracks", async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { trackId } = req.body;
    if (!trackId) return res.status(400).send("Request body requires: trackId");

    const playlistTrack = await createPlaylistTrack({
      playlist_id: req.playlist.id,
      track_id: trackId,
    });
    res.status(201).send(playlistTrack);
  } catch (err) {
    next(err);
  }
});
