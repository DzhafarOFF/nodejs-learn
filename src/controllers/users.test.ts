import request from "supertest";
import { app } from "..";

const MOCK_TOKEN = "get this token before execution the test";

describe("Server root", () => {
  it("GET /", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty("error");
  });
  // error: database "name of db" does not exist
  // thrown: "Exceeded timeout of 5000 ms for a test.
  it("GET /users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${MOCK_TOKEN}`)
      .catch((err) => {
        console.log({ err });
      });
  });
});
