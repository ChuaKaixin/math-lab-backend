const express = require("express");
const router = express.Router();
const handleAsyncError = require("express-async-wrap");
const userHandler = require("../authentication/user_handler");
const { passport } = require("../middleware/user_passport_middleware");

router.post("/signup", handleAsyncError(userHandler.registerNewUser));
router.post("/login", handleAsyncError(userHandler.login));
router.put(
  "/change_password",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(userHandler.changePassword)
);

router.post("/logout", handleAsyncError(userHandler.logout));

module.exports = router;
