const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
  score: Number,
  username: [String]
});

const ScoreBoardSchema = new mongoose.Schema({
  level: {
    type: String,
    require: true,
    unique: true
  },
  scoreList: [ScoreSchema]
});

module.exports = mongoose.model("ScoreBoard", ScoreBoardSchema);
