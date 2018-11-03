const express = require("express");
const router = express.Router();
const handleAsyncError = require("express-async-wrap");
const scoreBoardHandler = require("../handler/score_board_handler");
const { passport } = require("../middleware/user_passport_middleware");

router.get(
  "",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(scoreBoardHandler.getScoreBoard)
);

module.exports = router;
