const User = require("../model/user");
const status = require("http-status");
const CONSTANTS = require("../utils/constants");

async function registerNewUser(req, res) {
  let user = new User({
    username: req.body.user.username,
    accountType: CONSTANTS.normalUser
  });
  try {
    user.setPassword(req.body.user.password);
    await user.save();
  } catch (error) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({
      message: error.message
    });
  }
  return res.json({
    user: {
      username: user.username,
      accountType: user.accountType
    }
  });
}

async function changePassword(req, res) {
  const user = req.user;
  const newUserProfile = req.body.user;
  if (newUserProfile.password) {
    try {
      user.setPassword(newUserProfile.password);
    } catch (error) {
      return res.status(status.UNPROCESSABLE_ENTITY).json({
        message: error.message
      });
    }
  }
  await user.save();
  return res.json({ status: "done" });
}

async function login(req, res) {
  const username = req.body.user.username;
  const password = req.body.user.password;
  if (!username || !password) {
    return res.status(status.UNAUTHORIZED).json({
      message: "username and password are required for login"
    });
  }
  let user = await User.findOne({ username });
  if (!user || !user.validPassword(password)) {
    return res
      .status(status.UNAUTHORIZED)
      .json({ message: "username or password is invalid" });
  }
  const token = user.generateJWT();
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: true
  });
  return res.json({
    user: {
      username: user.username,
      accountType: user.accountType
    }
  });
}

async function logout(req, res) {
  res.clearCookie("jwt");
  res.json({ status: "done" });
}

module.exports = {
  registerNewUser,
  login,
  logout,
  changePassword
};
