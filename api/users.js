import { createUser } from "#db/queries/users";
import express from "express";
const usersRouter = express.Router();
export default usersRouter;

// ---------------------POST /users/register----------------------//

usersRouter.post("/register",async(req,res) =>{
    const username = req.body.username.trim();
    const password = req.body.password.trim();

// 1. Validate body
if (!username || !password) {
    return res.status(400).send("Request body requires: username, password");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);


    // 3. Create user in DB
    const user = await createUser(username, hashedPassword);

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id },             // payload
      process.env.JWT_SECRET,      // secret key (store in .env)
      { expiresIn: "1h" }          // token expires in 1 hour
    );

    // 5. Send response
    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, username: user.username },
      token,
    });
 res.json(users);

});


