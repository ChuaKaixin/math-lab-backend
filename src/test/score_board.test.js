process.env.NODE_ENV = "integration";

const testDB = require("./in_memory_mongodb_setup");
const fixtureLoader = require("./score_board_fixture");

const userFixtureLoader = require("./user_fixture");
const userFixtures = require("./user_fixture").fixtures;
const request = require("supertest");
const app = require("../app");
const status = require("http-status");
const CONSTANTS = require("../utils/constants");
const scoreBoardHandler = require("../handler/score_board_handler");

beforeAll(testDB.setup);
beforeAll(fixtureLoader.load);
beforeAll(userFixtureLoader.load);
afterAll(testDB.teardown);

async function loginSuccessful(password, agent, loginName) {
  let testUser = userFixtures.users[loginName];
  let username = testUser.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, password } });

  expect(response.statusCode).toBe(status.OK);
}

async function userSetupAndBoardRetrieval() {
  const agent = request.agent(app);
  await loginSuccessful(
    userFixtures.users["user1@email.com"].password,
    agent,
    "user1@email.com"
  );

  let response = await agent.get("/api/score_board");
  return response;
}

test("scoreboard retrieval via API is successful", async () => {
  let response = await userSetupAndBoardRetrieval();
  expect(response.statusCode).toBe(status.OK);
  let responseBody = response.body;
  expect(responseBody[0].level).toEqual(CONSTANTS.level1);
  expect(responseBody[0].scoreList[0]).toMatchObject({
    score: 20,
    username: ["user1@email.com"]
  });
});

test("scoreboard is updated correctly when there were no existing scores", async () => {
  scoreBoardHandler.updateScoreBoard("user2@email.com", 15, CONSTANTS.level2);
  let response = await userSetupAndBoardRetrieval();
  expect(response.statusCode).toBe(status.OK);
  let responseBody = response.body;
  expect(responseBody[1].level).toEqual(CONSTANTS.level2);
  expect(responseBody[1].scoreList[0]).toMatchObject({
    score: 15,
    username: ["user2@email.com"]
  });
});

test("scoreboard is updated correctly when score is to be inserted as the highest top score when there were existing scores", async () => {
  scoreBoardHandler.updateScoreBoard("user2@email.com", 20, CONSTANTS.level2);
  let response = await userSetupAndBoardRetrieval();
  expect(response.statusCode).toBe(status.OK);
  let responseBody = response.body;
  expect(responseBody[1].level).toEqual(CONSTANTS.level2);
  expect(responseBody[1].scoreList).toHaveLength(2);
  expect(responseBody[1].scoreList[0]).toMatchObject({
    score: 20,
    username: ["user2@email.com"]
  });
});

test("scoreboard is updated correctly when score is to be inserted as the middle score when there were existing scores", async () => {
  scoreBoardHandler.updateScoreBoard("user3@email.com", 18, CONSTANTS.level2);
  let response = await userSetupAndBoardRetrieval();
  expect(response.statusCode).toBe(status.OK);
  let responseBody = response.body;
  expect(responseBody[1].level).toEqual(CONSTANTS.level2);
  expect(responseBody[1].scoreList).toHaveLength(3);
  expect(responseBody[1].scoreList[1]).toMatchObject({
    score: 18,
    username: ["user3@email.com"]
  });
});

test("scoreboard is updated correctly when the score already exist and username is to be added", async () => {
  scoreBoardHandler.updateScoreBoard("user4@email.com", 18, CONSTANTS.level2);
  let response = await userSetupAndBoardRetrieval();
  expect(response.statusCode).toBe(status.OK);
  let responseBody = response.body;
  expect(responseBody[1].level).toEqual(CONSTANTS.level2);
  expect(responseBody[1].scoreList).toHaveLength(3);
  expect(responseBody[1].scoreList[1]).toMatchObject({
    score: 18,
    username: ["user3@email.com", "user4@email.com"]
  });
});

test("scoreboard is updated correctly when a score is to bump out existing score", async () => {
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    17,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    16,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    14,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    13,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    12,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    11,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    10,
    CONSTANTS.level2
  );
  await scoreBoardHandler.updateScoreBoard(
    "user4@email.com",
    25,
    CONSTANTS.level2
  );

  let response = await userSetupAndBoardRetrieval();
  expect(response.statusCode).toBe(status.OK);
  let responseBody = response.body;
  expect(responseBody[1].level).toEqual(CONSTANTS.level2);
  expect(responseBody[1].scoreList).toHaveLength(10);
  expect(responseBody[1].scoreList[0]).toMatchObject({
    score: 25,
    username: ["user4@email.com"]
  });
  expect(responseBody[1].scoreList[9]).toMatchObject({
    score: 11,
    username: ["user4@email.com"]
  });
});
