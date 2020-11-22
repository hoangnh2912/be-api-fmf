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
  NOTIFY_STATUS,
} = require("../const");
const { sendNotification } = require("../utils/notify");

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
      res.json(onError("Mã gia đình chưa đúng"));
    } else {
      const isUpdate = await User.findOneAndUpdate(
        { code },
        { host_code, status: STATUS.WAIT }
      );
      if (isUpdate) {
        sendNotification(
          host_code,
          NOTIFY_STATUS.ACCEPT,
          "Find my family",
          "Có yêu cầu tham gia"
        );
        res.json(onSuccess({ host_code }));
      } else res.json(onError("Mã code chưa đúng"));
    }
  } catch (error) {
    res.json(onError());
  }
});

router.get("/GetFamily", checkAuth, async (req, res) => {
  try {
    const { host_code, status } = await User.findOne({
      code: req.headers.code,
    });
    const is_host = host_code == req.headers.code;

    if (status == STATUS.WAIT && !is_host) {
      const alone = await User.findOne({ code: req.headers.code });
      const { name, phone, code, lastOnline } = alone;
      return res.json(
        onSuccessArray([{ name, phone, code, host_code, status, lastOnline }])
      );
    }
    if (status == STATUS.WAIT && is_host) {
      const alone = await User.findOne({ code: req.headers.code });
      const { name, phone, code, lastOnline } = alone;
      return res.json(
        onSuccessArray([
          {
            name: "",
            phone: "Vui lòng chia sẻ mã tham gia",
            code,
            host_code,
            status: 99,
          },
        ])
      );
    }
    if (!host_code) {
      return res.json(onError("Chưa tham gia host nào", 200));
    }

    const list = await User.find({ host_code });
    res.json(
      onSuccessArray(
        list
          .map(({ name, phone, code, host_code, status, lastOnline }) => ({
            name,
            phone,
            code,
            host_code,
            status,
            lastOnline,
          }))
          .filter((elem) => elem.code != req.headers.code)
      )
    );
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
        let {
          code,
          status,
          host_code,
          name,
        } = await User.findOneAndUpdate(condition, { status: STATUS.CONNECT });
        sendNotification(
          req.body.code,
          NOTIFY_STATUS.ACCEPT,
          "Find my family",
          "Bạn đã chấp nhận lời mời"
        );
        res.json(
          onSuccess({ code, status, host_code, name }, "Chấp nhận lời mời")
        );
      } else {
        await User.findOneAndUpdate(condition, { host_code: null });
        sendNotification(
          req.body.code,
          NOTIFY_STATUS.ACCEPT,
          "Find my family",
          "Bạn đã bị từ chối"
        );
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

router.post("/HostUnsubscribeMember", checkAuth, async (req, res) => {
  try {
    const condition = {
      code: req.body.code,
      host_code: req.body.host_code,
    };
    const checkMember = await User.findOne(condition);
    if (!checkMember) {
      res.json(onError("Thành viên khônh hợp lệ"));
    } else {
      let { code, name } = await User.findOneAndUpdate(condition, {
        host_code: null,
      });
      sendNotification(
        code,
        NOTIFY_STATUS.ACCEPT,
        "Find my family",
        "Bạn đã bị xoá khỏi gia đình"
      );
      res.json(onSuccess({ code, name }, "Đã xoá thành viên"));
    }
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

router.post("/UpdateDeviceId", checkAuth, async (req, res) => {
  try {
    const condition = {
      code: req.headers.code,
    };
    const deviceId = req.body.deviceId;
    let { code, name } = await User.findOneAndUpdate(condition, {
      deviceId,
    });
    res.json(onSuccess({ code, name, deviceId }, "Cập nhật thành công"));
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

router.post("/Logout", checkAuth, async (req, res) => {
  try {
    const code = req.headers.code;
    const condition = {
      code: req.headers.code,
    };
    let { name } = await User.findOneAndUpdate(condition, {
      deviceId: null,
    });
    res.json(onSuccess({ code, name }, "Đăng xuất thành công"));
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

router.post("/UpdateUserInfo", checkAuth, async (req, res) => {
  try {
    const condition = {
      code: req.headers.code,
    };
    const check = await User.findOne(condition);
    if (!check) {
      res.json(onError());
    } else {
      const { phone, name } = req.body;
      let { code } = await User.findOneAndUpdate(condition, {
        phone,
        name,
      });
      res.json(onSuccess({ code, phone, name }, "Sửa thông tin thành công"));
    }
  } catch (error) {
    console.log(error);
    res.json(onError());
  }
});

module.exports = router;
