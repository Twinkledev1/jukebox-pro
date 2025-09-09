import express from "express";
const tracksRouter = express.Router();
export default tracksRouter;

import { getTracks, getTrackById } from "#db/queries/tracks";

tracksRouter.get("/", async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

tracksRouter.get("/:id",async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  res.send(track);
});
