const loadFixture = require("mongoose-fixture-loader");
const ScoreBoard = require("../model/score_board");
const CONSTANTS = require("../utils/constants");

const fixtures = {};

async function createNewScore(level, username, score) {
  const scoreboard = new ScoreBoard({
    level,
    scoreList: [{ score, username: [username] }]
  });
  const scoreCreated = await loadFixture(ScoreBoard, scoreboard);

  return scoreCreated;
}

async function loadFixtures() {
  fixtures.scoreboards = {};
  const level = CONSTANTS.level1;
  let score = createNewScore(level, "user1@email.com", 20);
  fixtures.scoreboards[level] = score;
}

module.exports = {
  fixtures,
  load: loadFixtures
};
