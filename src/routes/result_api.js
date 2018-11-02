const express = require("express");
const router = express.Router();
const handleAsyncError = require("express-async-wrap");
const resultHandler = require("../handler/result_handler");
const { passport } = require("../middleware/user_passport_middleware");

router.get(
  "/attempt_count",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(resultHandler.getAttemptCount)
);

router.put(
  "/update_results",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(resultHandler.updateResult)
);

router.get(
  "",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(resultHandler.getResults)
);

module.exports = router;
