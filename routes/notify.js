const express = require("express");
const router = express.Router();
const Notify = require("../models/Notify");
const User = require("../models/User");
const { onError, onSuccess, onSuccessArray, checkAuth } = require("../const");
const { sendNotification } = require("../utils/notify");

router.get("/GetNotify", checkAuth, async (req, res) => {
  try {
    const { code } = req.headers;
    const notis = await Notify.find({ code });
    res.json(
      onSuccessArray(
        notis
          .map(({ headings, contents, createAt, type }) => ({
            headings,
            contents,
            createAt,
            type,
          }))
          .sort((a, b) => b.createAt - a.createAt)
      )
    );
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

router.post("/SendMessage", async (req, res) => {
  try {
    const { code, type, text } = req.body;
    const userSend = await User.findOne({ code: req.headers.code });
    if (userSend) {
      let contents = "";
      let headings = "";
      const { VIBRANT, MESSAGE } = require("../const").NOTIFY_STATUS;
      switch (type) {
        case VIBRANT:
          contents = `${userSend.name} đã gửi cảnh báo đến bạn`;
          headings = `Cảnh báo từ người thân`;
          break;
        case MESSAGE:
          contents = `${text}`;
          headings = `${userSend.name} đã gửi tin nhắn đến bạn`;
          break;
        default:
          return res.json(onError("Sai mã loại notify"));
      }
      sendNotification(code, type, headings, contents);
    }
    res.json(onSuccess({}));
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

module.exports = router;
