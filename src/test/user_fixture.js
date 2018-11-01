const loadFixture = require("mongoose-fixture-loader");
const User = require("../model/user");
const CONSTANTS = require("../utils/constants");

const fixtures = {};

function getNewUser(username, password) {
  const user = new User({
    username,
    accountType: CONSTANTS.normalUser
  });
  user.setPassword(password);

  return user;
}

async function createNewUser(userName) {
  const password = "mypassword";
  const user = await loadFixture(User, getNewUser(userName, password));
  // store the plaintext password for the test cases to simulate login
  // this is not stored in database
  user.password = password;
  return user;
}

async function loadFixtures() {
  fixtures.users = {};
  const userNames = ["user1@email.com", "user2@email.com"];
  for (let userName of userNames) {
    let user = await createNewUser(userName);
    fixtures.users[userName] = user;
  }
}

module.exports = {
  fixtures,
  load: loadFixtures
};
