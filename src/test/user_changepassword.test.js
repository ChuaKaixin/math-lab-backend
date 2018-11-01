process.env.NODE_ENV = "integration";

const testDB = require("./in_memory_mongodb_setup");
const fixtureLoader = require("./user_fixture");
const fixtures = require("./user_fixture").fixtures;
const request = require("supertest");
const app = require("../app");
const status = require("http-status");

beforeAll(testDB.setup);
beforeAll(fixtureLoader.load);
afterAll(testDB.teardown);

//let jwtToken;

async function loginSuccessful(password, agent) {
  let testUser = fixtures.users["user1@email.com"];
  let username = testUser.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, password } });

  expect(response.statusCode).toBe(status.OK);
}

async function loginFail(password, agent) {
  let testUser = fixtures.users["user1@email.com"];
  let username = testUser.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, password } });

  expect(response.statusCode).toBe(status.UNAUTHORIZED);
}

const secondNewPassword = "new-password";
test("Change password on the current user", async () => {
  const agent = request.agent(app);

  await loginSuccessful(fixtures.users["user1@email.com"].password, agent);

  const newPassword = secondNewPassword;
  const updatedUser = {
    password: newPassword
  };

  let response = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });
  //.set("Authorization", "Bearer " + jwtToken); --for jwt implementation

  expect(response.statusCode).toBe(status.OK);

  const agent2 = request.agent(app);
  await loginSuccessful(newPassword, agent2);
});

test("Change password to < min length", async () => {
  const agent = request.agent(app);
  await loginSuccessful(secondNewPassword, agent);

  const newPassword = "new";
  const updatedUser = {
    password: newPassword
  };

  let response = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });

  expect(response.statusCode).toBe(status.UNPROCESSABLE_ENTITY);
  expect(response.body.message).toBeDefined();
  expect(response.body.message).toEqual("Password min length is 8");

  const agent2 = request.agent(app);
  await loginFail(newPassword, agent2);
});

test("Change password without logging in should return 401", async () => {
  const agent = request.agent(app);
  const newPassword = "new-password";
  const updatedUser = {
    password: newPassword
  };

  let response = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });

  expect(response.statusCode).toBe(status.UNAUTHORIZED);
});
