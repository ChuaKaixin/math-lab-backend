const loadFixture = require("mongoose-fixture-loader");
const User = require("../model/user");
const CONSTANTS = require("../utils/constants");

const fixtures = {};

function getNewUser(username, password) {
  const user = new User({
    username,
    accountType: CONSTANTS.normalUser,
    userProgress: {
      level1: {
        progress: [
          {
            score: 10,
            attemptId: 1
          }
        ]
      },
      level2: {
        progress: [
          {
            score: 5,
            attemptId: 1
          }
        ]
      },
      level3: {
        progress: [
          {
            score: 3,
            attemptId: 1
          }
        ]
      }
    }
  });
  user.setPassword(password);

  return user;
}

function getNewUserWithNoResultRecords(username, password) {
  const user = new User({
    username,
    accountType: CONSTANTS.normalUser
  });
  user.setPassword(password);

  return user;
}

async function createNewUser(userName) {
  const password = "mypassword";
  let user = null;
  if (userName === "newuser@email.com") {
    user = await loadFixture(
      User,
      getNewUserWithNoResultRecords(userName, password)
    );
  } else {
    user = await loadFixture(User, getNewUser(userName, password));
  }
  // store the plaintext password for the test cases to simulate login
  // this is not stored in database
  user.password = password;
  return user;
}

async function loadFixtures() {
  fixtures.users = {};
  const userNames = ["user3@email.com", "user4@email.com", "newuser@email.com"];
  for (let userName of userNames) {
    let user = await createNewUser(userName);
    fixtures.users[userName] = user;
  }
}

module.exports = {
  fixtures,
  load: loadFixtures
};
