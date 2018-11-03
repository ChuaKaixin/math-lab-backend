process.env.NODE_ENV = "integration";

const testDB = require("./in_memory_mongodb_setup");
const fixtureLoader = require("./result_fixture");
const fixtures = require("./result_fixture").fixtures;
const request = require("supertest");
const app = require("../app");
const status = require("http-status");
const CONSTANTS = require("../utils/constants");

beforeAll(testDB.setup);
beforeAll(fixtureLoader.load);
afterAll(testDB.teardown);

async function loginSuccessful(password, agent, loginName) {
  let testUser = fixtures.users[loginName];
  let username = testUser.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, password } });

  expect(response.statusCode).toBe(status.OK);
}

test("that attempts can be retrieved for each user", async () => {
  const agent = request.agent(app);
  await loginSuccessful(
    fixtures.users["user3@email.com"].password,
    agent,
    "user3@email.com"
  );

  let response = await agent.get("/api/result/attempt_count");
  expect(response.statusCode).toBe(status.OK);
  let resultJson = response.body;
  expect(resultJson[CONSTANTS.level1]).toEqual(1);
  expect(resultJson[CONSTANTS.level2]).toEqual(1);
  expect(resultJson[CONSTANTS.level3]).toEqual(1);
});

test("that results can be updated successfully when there are existing results", async () => {
  const agent = request.agent(app);
  await loginSuccessful(
    fixtures.users["user3@email.com"].password,
    agent,
    "user3@email.com"
  );

  const results = {
    level: CONSTANTS.level1,
    score: 20
  };
  let response = await agent.put("/api/result/update_results").send(results);
  expect(response.statusCode).toBe(status.OK);
  let resultJson = response.body;
  expect(Object.keys(resultJson.progress)).toHaveLength(2);
  expect(resultJson.progress[1]).toMatchObject({ score: 20, attemptId: 2 });
});

test("that results can be retrieved successfully", async () => {
  const agent = request.agent(app);
  await loginSuccessful(
    fixtures.users["user3@email.com"].password,
    agent,
    "user3@email.com"
  );
  let response = await agent.get("/api/result");
  expect(response.statusCode).toBe(status.OK);
  let resultJson = response.body.results;
  expect(resultJson[CONSTANTS.level1].progress).toHaveLength(2);
  expect(resultJson[CONSTANTS.level2].progress).toHaveLength(1);
  expect(resultJson[CONSTANTS.level3].progress).toHaveLength(1);
});

test("that results can be updated successfully when the user does not have any existing results", async () => {
  const agent = request.agent(app);
  await loginSuccessful(
    fixtures.users["newuser@email.com"].password,
    agent,
    "newuser@email.com"
  );

  const results = {
    level: CONSTANTS.level1,
    score: 20
  };
  let response = await agent.put("/api/result/update_results").send(results);
  expect(response.statusCode).toBe(status.OK);
  let resultJson = response.body;
  expect(Object.keys(resultJson.progress)).toHaveLength(1);
  expect(resultJson.progress[0]).toMatchObject({ score: 20, attemptId: 1 });

  response = await agent.get("/api/result");
  expect(response.statusCode).toBe(status.OK);
  resultJson = response.body.results;
  expect(resultJson[CONSTANTS.level1].progress).toHaveLength(1);
  expect(resultJson[CONSTANTS.level1].progress[0]).toMatchObject({
    score: 20,
    attemptId: 1
  });
});

test("that results can be updated successfully for a level he has not attempted before", async () => {
  const agent = request.agent(app);
  await loginSuccessful(
    fixtures.users["newuser@email.com"].password,
    agent,
    "newuser@email.com"
  );

  const results = {
    level: CONSTANTS.level2,
    score: 15
  };
  let response = await agent.put("/api/result/update_results").send(results);
  expect(response.statusCode).toBe(status.OK);
  let resultJson = response.body;
  expect(Object.keys(resultJson.progress)).toHaveLength(1);
  expect(resultJson.progress[0]).toMatchObject({ score: 15, attemptId: 1 });

  response = await agent.get("/api/result");
  expect(response.statusCode).toBe(status.OK);
  resultJson = response.body.results;

  expect(resultJson[CONSTANTS.level2].progress).toHaveLength(1);
  expect(resultJson[CONSTANTS.level2].progress[0]).toMatchObject({
    score: 15,
    attemptId: 1
  });
});
