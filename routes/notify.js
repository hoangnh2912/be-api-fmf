const express = require("express");
const router = express.Router();
const Notify = require("../models/Notify");
const { onError, onSuccess, onSuccessArray, checkAuth } = require("../const");

router.get("/GetNotify", checkAuth, async (req, res) => {
  try {
    res.json(onSuccessArray([]));
  } catch (error) {
    res.json(onError());
  }
});

router.post("/SendMessage", checkAuth, async (req, res) => {
  try {
  } catch (error) {
    res.json(onError());
  }
});

module.exports = router;
