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

async function loginSuccessful(password, agent) {
  let testUser = fixtures.users["user1@email.com"];
  let username = testUser.username;
  let response = await agent
    .post("/api/user/login")
    .send({ user: { username, password } });

  expect(response.statusCode).toBe(status.OK);
}

test("Logout should clear the cookie storing JWT token", async () => {
  const agent = request.agent(app);

  await loginSuccessful(fixtures.users["user1@email.com"].password, agent);

  let logoutResponse = await agent.post("/api/user/logout").send();
  expect(logoutResponse.statusCode).toBe(status.OK);

  // if we try to change password after logout, we expect to get back
  // Unauthorized (HTTP 401) in the response
  const newPassword = "new-password";
  const updatedUser = {
    password: newPassword
  };

  let changePwdResponse = await agent
    .put("/api/user/change_password")
    .send({ user: updatedUser });

  expect(changePwdResponse.statusCode).toBe(status.UNAUTHORIZED);
});
