const express = require("express");
const router = express.Router();
const Notify = require("../models/Notify");
const User = require("../models/User");
const { onError, onSuccess, onSuccessArray, checkAuth } = require("../const");

const sendNotification = async (
  code,
  type,
  headings = "Find my family",
  contents = "Chúc bạn 1 ngày tốt lành",
  body = {}
) => {
  const user = await User.findOne({ code });
  if (user) {
    const { deviceId } = user;
    var axios = require("axios");
    var data = JSON.stringify({
      app_id: "bd947489-155a-4152-bb81-d64fdb0af249",
      headings: { en: headings },
      contents: { en: contents },
      data: body,
      android_channel_id: "7728994d-5f5f-4429-a2e6-e8a17ec24cec",
      include_player_ids: [deviceId],
    });

    var config = {
      method: "post",
      url: "https://onesignal.com/api/v1/notifications",
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        new Notify({ contents, headings, code, type }).save();
      })
      .catch(function (error) {
        console.log(error);
      });
  }
};

router.get("/GetNotify", checkAuth, async (req, res) => {
  try {
    const { code } = req.headers;
    const notis = await Notify.find({ code });
    res.json(
      onSuccessArray(
        notis.map(({ headings, contents, createAt, type }) => ({
          headings,
          contents,
          createAt,
          type,
        }))
      )
    );
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

router.post("/SendMessage", async (req, res) => {
  try {
    const { code, type } = req.body;
    sendNotification(code, type);
    res.json(onSuccess({}));
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

module.exports = router;
