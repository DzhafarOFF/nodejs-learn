import express from "express";
import { v4 as uuidv4 } from "uuid";

const PORT = 3000;
const app = express();
app.use(express.json());
class User {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;

  constructor(login: string, password: string, age: number) {
    this.id = uuidv4();
    this.login = login;
    this.password = password;
    this.age = age;
    this.isDeleted = false;
  }
}

const users: User[] = [];

app.get("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.send(user);
});

app.post("/users", (req, res) => {
  const { login, password, age } = req.body;
  const user = new User(login, password, age);
  users.push(user);
  res.send(user);
});

app.put("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  const { login, password, age } = req.body;
  console.log(
    `User ${user.id} has been updated`,
    `old user data: ${JSON.stringify(user)}`
  );
  user.login = login;
  user.password = password;
  user.age = age;
  res.send(user);
  console.log(`new user data: ${JSON.stringify(user)}`);
});

app.get("/users", (req, res) => {
  const { loginSubstring, limit = 20 } = req.query;
  console.log(
    `Request performed with queries loginSubstring: ${loginSubstring}; limit: ${limit}`
  );
  if (!loginSubstring) {
    const limitedUsers = users.slice(0, limit as number);
    return res.send(limitedUsers);
  }
  const filteredUsers = users.filter(
    (user) => user.login.includes(loginSubstring as string) && !user.isDeleted
  );
  const sortedUsers = filteredUsers.sort((a, b) =>
    a.login.localeCompare(b.login)
  );
  const limitedUsers = sortedUsers.slice(0, limit as number);
  res.send(limitedUsers);
});

app.delete("/users", (req, res) => {
  const { id } = req.body;
  const user = users.find((user) => user.id === id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  user.isDeleted = true;
  console.log(`User ${user.id} has been deleted`);
  res.send(user);
});

app.listen(PORT, () => {
  console.log("Server is running on 3000 port");
});
