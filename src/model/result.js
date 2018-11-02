const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  dateTimeOfAttempt: {
    type: Date,
    default: Date.now,
    required: true
  },
  score: {
    type: Number,
    default: 0,
    required: true
  },
  attemptId: {
    type: Number
  }
});

const ResultSchema = new mongoose.Schema({
  progress: [AttemptSchema]
});

module.exports = mongoose.model("Result", ResultSchema);
