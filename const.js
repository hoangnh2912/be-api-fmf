const User = require("./models/User");
const sha256 = require("sha256");

const STATUS = {
  CONNECT: 0,
  DISCONNECT: 1,
  WAIT: 2,
};

const onError = (message, code) => {
  return {
    message: message || "Đã có lỗi xảy ra",
    code: code || 500,
    status: 0,
  };
};
module.exports = {
  STATUS,
  onError,
  onSuccess(data) {
    const { note, timestamp, _id } = data;
    const res = {
      id: _id,
      note,
      timestamp,
      ...data,
    };
    return {
      data: res,
      message: "Thành công",
      code: 200,
      status: 1,
    };
  },
  onSuccessArray(data) {
    if (data && data.length != 0) {
      return {
        data,
        message: "Thành công",
        code: 200,
        status: 1,
      };
    }
    return {
      data: [],
      message: "Rỗng",
      code: 204,
      status: 1,
    };
  },
  checkAuth: async (req, res, callback) => {
    try {
      const { code } = req.headers;
      const checkCode = await User.findOne({ code });
      if (!checkCode) res.json(onError("Mã code chưa đúng"));
      else callback();
    } catch (error) {
      console.log(error);
      res.json(onError());
    }
  },
  getToken(req) {
    return sha256(req.body.username + Date.now() + req.body.password);
  },
};
