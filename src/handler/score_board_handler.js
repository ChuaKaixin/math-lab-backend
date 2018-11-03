const ScoreBoard = require("../model/score_board");
const CONSTANTS = require("../utils/constants");

async function updateScoreBoard(username, score, level) {
  const scoreBoard = await ScoreBoard.findOne({ level });
  let scores = [];
  let scoreInserted = false;
  if (scoreBoard) {
    scores = scoreBoard.scoreList;
  }
  if (scores && scores.length > 0) {
    for (let index = 0; index < scores.length; index++) {
      if (scores[index].score === score) {
        if (!scores[index].username.includes(username)) {
          scores[index].username.push(username);
          scoreInserted = true;
        } else {
          scoreInserted = true;
        }
        break;
      } else if (scores[index].score < score) {
        scores.splice(index, 0, { score, username: [username] });
        scoreInserted = true;
        break;
      }
    }
    //when score is not inserted but we have not filled up the top 10 spaces
    if (scores.length < CONSTANTS.topScoreLimit && !scoreInserted) {
      scores.push({ score, username: [username] });
    } else if (scores.length > CONSTANTS.topScoreLimit) {
      scores.splice(scores.length - 1, 1);
    }
  } else {
    scores.push({ score, username: [username] });
  }
  await ScoreBoard.findOneAndUpdate(
    { level },
    { $set: { scoreList: scores } },
    { upsert: true }
  );
}

async function getScoreBoard(req, res) {
  const scoreBoard = await ScoreBoard.find();
  return res.json(scoreBoard);
}
module.exports = { updateScoreBoard, getScoreBoard };
