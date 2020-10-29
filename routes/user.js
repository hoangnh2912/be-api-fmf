const express = require("express");
const router = express.Router();
const sha256 = require("sha256");
const User = require("../models/User");
const {
  onError,
  onSuccess,
  onSuccessArray,
  checkAuth,
  STATUS,
} = require("../const");
router.post("/InputUserInfo", async (req, res) => {
  try {
    if (!req.body.phone || !req.body.name)
      return res.json(onError("Thiếu thông tin"));

    const phoneRq = req.body.phone;
    const checkIsExistPhone = await User.findOne({ phone: phoneRq });
    if (!checkIsExistPhone) {
      const createUser = await new User({
        ...req.body,
        code: sha256(phoneRq + new Date().getTime()).substr(0, 8),
      }).save();
      const { code, name, phone } = createUser;
      res.json(onSuccess({ code, name, phone }));
    } else {
      const { code } = await User.findOneAndUpdate(
        { phone: checkIsExistPhone.phone },
        { name: req.body.name }
      );
      res.json(onSuccess({ code, name: req.body.name }));
    }
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});
router.post("/SubscribeHost", checkAuth, async (req, res) => {
  try {
    const { host_code } = req.body;
    const { code } = req.headers;
    const checkHostCode = await User.findOne({ code: host_code });
    if (!checkHostCode) {
      res.json(onError("Mã host code chưa đúng"));
    } else {
      const isUpdate = await User.findOneAndUpdate(
        { code },
        { host_code, status: STATUS.WAIT }
      );
      if (isUpdate) res.json(onSuccess({ host_code }));
      else res.json(onError("Mã code chưa đúng"));
    }
  } catch (error) {
    res.json(onError());
  }
});

router.get("/GetFamily", checkAuth, async (req, res) => {
  try {
    const { host_code } = await User.findOne({ code: req.headers.code });
    if (!host_code) {
      res.json(onError("Chưa tham gia host nào"));
    } else {
      const list = await User.find({ host_code });
      res.json(
        onSuccessArray(
          list
            .map(({ name, phone, code, host_code }) => ({
              name,
              phone,
              code,
              host_code,
            }))
            .filter((elem) => elem.code != host_code)
        )
      );
    }
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});
router.post("/HostAcceptSubscribe", checkAuth, async (req, res) => {
  try {
    const condition = {
      host_code: req.headers.code,
      status: STATUS.WAIT,
      code: req.body.code,
    };
    const checkMember = await User.findOne(condition);
    if (!checkMember) {
      res.json(onError("Không có lời mời nào"));
    } else {
      if (req.body.is_accept) {
        let { code, status, host_code } = await User.findOneAndUpdate(
          condition,
          { status: STATUS.CONNECT }
        );
        res.json(onSuccess({ code, status, host_code }, "Chấp nhận lời mời"));
      } else {
        await User.findOneAndUpdate(condition, { host_code: null });
        res.json(
          onSuccess(
            { host_code: condition.host_code, code: condition.code },
            "Từ chối lời mời"
          )
        );
      }
    }
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

module.exports = router;
