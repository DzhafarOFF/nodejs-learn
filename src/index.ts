import express from "express";
import { Pool } from "pg";
import { config } from "./config";
import { createDB } from "./database";
import {
  getErrorResponseData,
  getFilteredAndSortedUsersLogin,
  getResponseData,
  getUserDataWithoutPassword,
} from "./helpers";
import { validateBody } from "./validation";

createDB();

const PORT = 3000;

const app = express();

const pool = new Pool({
  database: config.DATA_BASE_NAME,
  host: "localhost",
  port: 5432,
});

app.use(express.json());

app.get("/users", (req, res) => {
  const { loginSubstring, limit = 20 } = req.query;

  console.log(
    `GET /users request performed with queries loginSubstring: ${loginSubstring}; limit: ${limit}`
  );

  pool.query(
    "SELECT * FROM users WHERE is_deleted = false ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }

      const users = results.rows;

      if (!loginSubstring) {
        const limitedUsers = users
          .slice(0, limit as number)
          .map((user) => user.login);

        res.json(getResponseData(limitedUsers));
      } else {
        const usersLoginArray = getFilteredAndSortedUsersLogin(
          users,
          loginSubstring as string,
          limit as number
        );

        res.json(getResponseData(usersLoginArray));
      }
    }
  );
});

app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }

    const users = results.rows;

    const user = users[0];

    if (!user) {
      console.log(`User ${id} not found`);
      return res.status(404).json(getErrorResponseData("User not found"));
    }

    console.log(`User ${user.id} has been found`);

    res
      .status(200)
      .json({ success: true, data: getUserDataWithoutPassword(user) });
  });
});

app.post("/users", validateBody, (req, res) => {
  const { login, password, age } = req.body;

  pool.query(
    "INSERT INTO users (login, password, age, is_deleted) VALUES ($1, $2, $3, false) RETURNING *",
    [login, password, age],
    (error, results) => {
      if (error) {
        throw error;
      }

      const user = results.rows[0];

      console.log(`User ${user.id} has been added`);

      res.status(201).json(getResponseData(getUserDataWithoutPassword(user)));
    }
  );
});

app.put("/users/:id", validateBody, (req, res) => {
  const id = parseInt(req.params.id);

  const { login, password, age } = req.body;

  pool.query(
    "UPDATE users SET login = $1, password = $2, age = $3 WHERE id = $4 RETURNING *",
    [login, password, age, id],
    (error, results) => {
      if (error) {
        throw error;
      }

      const user = results.rows[0];

      if (!user) {
        return res.status(404).json(getErrorResponseData("User not found"));
      }

      console.log(
        `User ${user.id} has been updated`,
        `old user data: ${JSON.stringify(user)}`
      );

      res.json(getResponseData(getUserDataWithoutPassword(user)));
    }
  );
});

app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(
    "UPDATE users SET is_deleted = true WHERE id = $1 RETURNING *",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      const user = results.rows[0];

      if (!user) {
        return res.status(404).json(getErrorResponseData("User not found"));
      }

      console.log(
        `DELETE /users request performed. User ${user.id} has been deleted`
      );

      res.json(getResponseData(getUserDataWithoutPassword(user)));
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
