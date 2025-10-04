import express from "express";
import User from "../models/User.js";
import { auth } from "../middleware/tokenMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

//* Get all users
router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    //* Find users
    const findUsers = await User.find();
    if (!findUsers) {
      return res.status(404).send("Users not found!");
    } else {
      return res.status(200).json(findUsers);
    }
  } catch (err) {
    next(err);
  }
});



export default router;
