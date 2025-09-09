import express from "express";
const tracksRouter = express.Router();
export default tracksRouter;

import { getTracks, getTrackById } from "#db/queries/tracks";
import { getPlaylistsByTrackIdAndUserId } from "#db/queries/playlists";
import getUserFromToken from "#middleware/getUserFromToken";
import requireUser from "#middleware/requireUser";

// GET /tracks - Public route (no authentication required)
tracksRouter.get("/", async (req, res, next) => {
  try {
    const tracks = await getTracks();
    res.send(tracks);
  } catch (err) {
    next(err);
  }
});

// GET /tracks/:id - Public route (no authentication required)
tracksRouter.get("/:id", async (req, res, next) => {
  try {
    const track = await getTrackById(req.params.id);
    if (!track) return res.status(404).send("Track not found.");
    res.send(track);
  } catch (err) {
    next(err);
  }
});

// GET /tracks/:id/playlists - Protected route
// Returns all playlists owned by the user that contain this track
tracksRouter.get("/:id/playlists", 
  getUserFromToken, 
  requireUser, 
  async (req, res, next) => {
    try {
      // First check if the track exists
      const track = await getTrackById(req.params.id);
      if (!track) return res.status(404).send("Track not found.");

      // Get playlists that contain this track AND are owned by the user
      const playlists = await getPlaylistsByTrackIdAndUserId(
        req.params.id,
        req.user.id
      );
      res.send(playlists);
    } catch (err) {
      next(err);
    }
  }
);