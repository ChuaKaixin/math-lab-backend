process.env.NODE_ENV = "integration";

const testDB = require("./in_memory_mongodb_setup");
const request = require("supertest");
const app = require("../app");
const status = require("http-status");
const CONSTANTS = require("../utils/constants");

beforeAll(testDB.setup);
afterAll(testDB.teardown);

describe("New user signup", () => {
  test("Register a new user successfully", async () => {
    const username = "myemail@email.com";
    const password = "mypassword";

    let response = await request(app)
      .post("/api/user/signup")
      .send({ user: { username, password } });
    let userJson = response.body.user;

    expect(response.statusCode).toBe(status.OK);
    expect(userJson).toBeDefined();
    expect(userJson.username).toEqual(username);
    expect(userJson.accountType).toEqual(CONSTANTS.normalUser);
  });

  test("Register with username that already exist", async () => {
    const username = "myemail@email.com";
    const password = "mypassword";

    let response = await request(app)
      .post("/api/user/signup")
      .send({ user: { username, password } });
    let errorJson = response.body.message;

    expect(response.statusCode).toBe(status.UNPROCESSABLE_ENTITY);
    expect(errorJson).toBeDefined();
    expect(errorJson).toEqual(
      "User validation failed: username: should be unique"
    );
  });

  test("Register with password less than min length", async () => {
    const username = "usernew@email.com";
    const password = "1234";

    let response = await request(app)
      .post("/api/user/signup")
      .send({ user: { username, password } });
    let errorJson = response.body.message;

    expect(response.statusCode).toBe(status.UNPROCESSABLE_ENTITY);
    expect(errorJson).toBeDefined();
    expect(errorJson).toEqual("Password min length is 8");
  });
});
