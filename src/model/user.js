const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const CONSTANTS = require("../utils/constants");
const Result = require("./result");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    validate: [/\S+@\S+/, "not a valid email address"],
    index: true,
    lowercase: true,
    unique: true,
    required: true
  },
  accountType: {
    type: String,
    enum: [CONSTANTS.normalUser, CONSTANTS.fbUser]
  },
  passwordHash: String,
  passwordSalt: String,
  userProgress: {
    type: mongoose.Schema.Types.Mixed
  }
});

UserSchema.methods.validPassword = function(password) {
  return this.passwordHash === hashPassword(password, this.passwordSalt);
};

UserSchema.methods.setPassword = function(password) {
  if (password.length >= 8) {
    this.passwordSalt = generateSalt();
    this.passwordHash = hashPassword(password, this.passwordSalt);
  } else {
    let error = new Error("Password min length is 8");
    throw error;
  }
};

function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
}

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

UserSchema.methods.verifyJWT = function(token) {
  try {
    jwt.verify(token, secret);
    return true;
  } catch (e) {
    return false;
  }
};

UserSchema.methods.generateJWT = function() {
  return jwt.sign(
    {
      userid: this._id,
      username: this.username
    },
    secret
  );
};

UserSchema.plugin(uniqueValidator, { message: "should be unique" });
module.exports = mongoose.model("User", UserSchema);

/**
 * user
 *  - level
 *    - no. of attempts
 *    - attempt
 *      - attempt id
 *      - score
 *      - date time of attempt
 *
 * scoreboard
 *  - level
 *    array of scores
 *    - user
 *    - score
 */
