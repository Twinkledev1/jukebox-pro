import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "#db/queries/users";
import { createToken } from "#utils/jwt";
import requireBody from "#middleware/requireBody";

const router = express.Router();
export default router;

// POST /users/register
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in DB
      const user = await createUser(username, hashedPassword);

      // Generate JWT using the utility function
      const token = createToken({ id: user.id });

      // Send token as plain text (based on test expectations)
      res.status(201).send(token);
    } catch (err) {
      next(err);
    }
  }
);

// POST /users/login
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(400).send("Invalid credentials");
      }

      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).send("Invalid credentials");
      }

      // Generate JWT using the utility function
      const token = createToken({ id: user.id });

      // Send token as plain text
      res.status(200).send(token);
    } catch (err) {
      next(err);
    }
  }
);
