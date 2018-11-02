process.env.NODE_ENV = "integration";

const testDB = require("./in_memory_mongodb_setup");
const fixtureLoader = require("./user_fixture");
const fixtures = require("./user_fixture").fixtures;
const request = require("supertest");
const app = require("../app");
const status = require("http-status");
const CONSTANTS = require("../utils/constants");

beforeAll(testDB.setup);
beforeAll(fixtureLoader.load);
afterAll(testDB.teardown);

describe("User authentication", () => {
  test("User login successfully [JWT in cookie implementation]", async () => {
    let testUser = fixtures.users["user1@email.com"];
    let password = testUser.password;
    let username = testUser.username;
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, password } });

    let userJson = response.body.user;
    expect(response.statusCode).toBe(200);
    expect(userJson).toBeDefined();
    expect(userJson.accountType).toEqual(CONSTANTS.normalUser);
    const jwtTokenCookie = [expect.stringMatching(/jwt/)];
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining(jwtTokenCookie)
    );
  });

  test("Login with invalid username", async () => {
    let password = "bogus";
    let username = "bogus@example.com";
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, password } });
    expect(response.statusCode).toBe(status.UNAUTHORIZED);
    let responseErrors = response.body.message;
    expect(responseErrors).toEqual("username or password is invalid");
  });

  test("Login with invalid password", async () => {
    let testUser = fixtures.users["user1@email.com"];
    let password = "bogus";
    let username = testUser.username;
    let response = await request(app)
      .post("/api/user/login")
      .send({ user: { username, password } });
    expect(response.statusCode).toBe(status.UNAUTHORIZED);
    let responseErrors = response.body.message;
    expect(responseErrors).toEqual("username or password is invalid");
  });
});
