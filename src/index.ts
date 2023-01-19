import express from "express";
import {
  getErrorResponseData,
  getFilteredAndSortedUsersLogin,
  getResponseData,
  getUserDataWithoutPassword,
} from "./helpers";
import { User } from "./user";
import { validateBody } from "./validation";

const PORT = 3000;

const app = express();

app.use(express.json());

const users: User[] = [];

app.get("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);

  if (!user) {
    console.log(`User ${req.params.id} not found`);
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  console.log(`User ${user.id} has been found`);

  res.json({ success: true, data: getUserDataWithoutPassword(user) });
});

app.post("/users", validateBody, (req, res) => {
  const { login, password, age } = req.body;

  const user = new User(login, password, age);

  users.push(user);

  console.log(`User ${user.id} has been added`);

  res.json(getResponseData(getUserDataWithoutPassword(user)));
});

app.put("/users/search/:id", validateBody, (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }
  const { login, password, age } = req.body;
  console.log(
    `User ${user.id} has been updated`,
    `old user data: ${JSON.stringify(user)}`
  );
  user.login = login;
  user.password = password;
  user.age = age;
  res.json(getResponseData(getUserDataWithoutPassword(user)));
  console.log(`new user data: ${JSON.stringify(user)}`);
});

app.get("/users", (req, res) => {
  const { loginSubstring, limit = 20 } = req.query;

  console.log(
    `GET /users request performed with queries loginSubstring: ${loginSubstring}; limit: ${limit}`
  );

  if (!loginSubstring) {
    const limitedUsers = users
      .slice(0, limit as number)
      .map((user) => user.login);
    return res.json(getResponseData(limitedUsers));
  }

  const usersLoginArray = getFilteredAndSortedUsersLogin(
    users,
    loginSubstring as string,
    limit as number
  );

  res.json(getResponseData(usersLoginArray));
});

app.delete("/users", (req, res) => {
  const { id } = req.body;
  const user = users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  user.isDeleted = true;

  console.log(
    `DELETE /users request performed. User ${user.id} has been deleted`
  );

  res.json(getResponseData(getUserDataWithoutPassword(user)));
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
