const express = require("express");
const authMiddleware = require("../middleware");
const { Account } = require("../db");
const { default: mongoose } = require("mongoose");

const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, async (req, res) => {
  //   console.log(req.userId);
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.json({
    balance: account.balance,
  });
});

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { to, amount } = req.body;
  //
  const account = await Account.findOne({
    userId: req.userId,
  }).session(session);
  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.json({
      msg: "Insufficient Balance",
    });
  }
  const toAccount = await Account.findOne({
    userId: to,
  }).session(session);
  if (!toAccount) {
    await session.abortTransaction();
    return res.json({
      msg: "Invalid Account ",
    });
  }

  await Account.updateOne(
    {
      userId: req.userId,
    },
    {
      $inc: {
        balance: -amount,
      },
    }
  ).session(session);
  await Account.updateOne(
    {
      userId: to,
    },
    {
      $inc: {
        balance: amount,
      },
    }
  ).session(session);
  await session.commitTransaction();
  res.json({
    msg: "Transfer SucessFull",
  });
});
module.exports = accountRouter;
