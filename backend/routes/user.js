const express = require("express");
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware");
const jwt_Secret = require("../config");
const userRouter = express.Router();
const cors = require("cors");

const SignupData = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});
userRouter.post("/signup", async (req, res) => {
  const createuser = req.body;
  const parseUser = SignupData.safeParse(createuser);
  if (!parseUser.success) {
    return res.status(411).json({
      msg: "Invalid Data",
    });
  }
  const existingUser = await User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    return res.status(411).json({
      msg: "User is already Exist in the Database",
    });
  }
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const userId = user._id;
  //   console.log(userId);
  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });
  const token = jwt.sign({ userId }, jwt_Secret);
  res.json({
    msg: "User Created Successfully",
    token: token,
  });
});

const signIn = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
userRouter.post("/signin", async (req, res) => {
  const sign = req.body;
  const parseSign = signIn.safeParse(sign);
  if (!parseSign.success) {
    return res.status(411).json({
      msg: "Please Enter  valid Input",
    });
  }
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign({ user: user._id }, jwt_Secret);
    return res.json({
      token: token,
    });
  }
  res.status(411).json({
    msg: "Error while Logging",
  });
});
const update = zod.object({
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
  password: zod.string().optional(),
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const { success } = update.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      msg: "Please Enter  valid Inputs",
    });
  }
  await User.updateOne({ _id: req.userId }, req.body);
  //   console.log(req.userId);
  res.json({
    msg: "Updated Successfully",
  });
});

module.exports = userRouter;
