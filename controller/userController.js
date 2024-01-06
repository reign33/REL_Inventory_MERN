import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import config from "../utils/config.js";

async function getUsers(req, res) {
  const users = await User.find({}).populate("category", {
    content: 1,
    important: 1,
  });
  return res.json(users);
} //this function is just for checking para pwede i hit sa browser for testing

async function createUser(req, res, next) {
  const { username, password } = req.body;

  const saltRounds = 10; //level of hashing
  const passwordHash = await bcrypt.hash(password, saltRounds); // two params (data, how complicated the hashing)

  const user = new User({
    username,
    passwordHash,
  });

  try {
    const savedUser = await user.save();

    return res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  //representation lang ng user
  const userForToken = {
    username: user.username,
    id: user._id, //kaya _id kinukuha lang ntn galing kay schema
  };

  const token = jwt.sign(userForToken, config.JWT_SECRET, {
    expiresIn: 60 * 6000,
  }); //

  return res
    .status(200)
    .json({ token, username: user.username, name: user.name });
}

export default {
  createUser,
  getUsers,
  loginUser,
};
