const User = require("../model/user");

async function getAttemptCount(req, res) {
  const user = req.user;
  let attemptCount = {};
  if (user.userProgress) {
    Object.keys(user.userProgress).forEach(key => {
      attemptCount[key] = Object.keys(user.userProgress[key].progress).length;
    });
  }
  return res.json(attemptCount);
}

async function updateResult(req, res) {
  const user = req.user;
  let userProgress = user.userProgress;
  let currentAttemptCount = 0;

  if (userProgress) {
    //initialize the level results if user did not previously have it.
    if (!userProgress[req.body.level]) {
      userProgress[req.body.level] = { progress: [] };
    }
    currentAttemptCount = userProgress[req.body.level].progress.length;
  } else {
    userProgress = {};
    userProgress[req.body.level] = { progress: [] };
  }

  let nextId = currentAttemptCount + 1;
  userProgress[req.body.level].progress[currentAttemptCount] = {
    score: req.body.score,
    attemptId: nextId
  };
  await User.findByIdAndUpdate(user._id, { $set: { userProgress } });
  return res.json(userProgress[req.body.level]);
}

async function getResults(req, res) {
  const user = req.user;
  if (user.userProgress) {
    return res.json({ results: user.userProgress });
  } else {
    return res.json({});
  }
}

module.exports = { getAttemptCount, updateResult, getResults };
