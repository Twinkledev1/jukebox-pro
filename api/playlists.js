import express from "express";
const playlistsRouter = express.Router();
export default playlistsRouter;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";


playlistsRouter.post("/", async (req, res, next) => {
  try {
    const { name, description, user_id } = req.body; 

    if (!name || !description || !user_id) {
      return res
        .status(400)
        .send("Request body requires: name, description, user_id");
    }

    const playlist = await createPlaylist(name, description, user_id);
    res.status(201).send(playlist);
  } catch (err) {
    next(err);
  }
});


playlistsRouter.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  req.playlist = playlist;
  next();
});

playlistsRouter.get("/:id", async (req, res) => {
  res.send(req.playlist);
});

playlistsRouter.get("/:id/tracks", async (req, res) => {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  });
  // .post(async (req, res) => {
  //   if (!req.body) return res.status(400).send("Request body is required.");

  //   const { trackId } = req.body;
  //   if (!trackId) return res.status(400).send("Request body requires: trackId");

  //   const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
  //   res.status(201).send(playlistTrack);
  // });
