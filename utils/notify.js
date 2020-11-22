const Notify = require("../models/Notify");
const User = require("../models/User");

const sendNotification = async (
  code,
  type,
  headings = "Find my family",
  contents = "",
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
      data: { type, ...body },
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
        new Notify({ contents, headings, code, type }).save();
      })
      .catch(function (error) {
        console.log(error);
      });
  }
};
module.exports = {
  sendNotification,
};
