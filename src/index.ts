import express from "express";
import { Pool } from "pg";
import { config } from "./config";
import {
  addGroup,
  addUserTransaction,
  createDB,
  removeGroupTransaction,
  removeUserTransaction,
  selectUserByIdQuery,
} from "./database";
import {
  getErrorResponseData,
  getFilteredAndSortedUsersLogin,
  getResponseData,
  getUserDataWithoutPassword,
} from "./helpers";
import { validateGroupBody, validateUserBody } from "./validation";

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

  pool.query(selectUserByIdQuery, [id], (error, results) => {
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

app.post("/users", validateUserBody, async (req, res) => {
  const user = await addUserTransaction(req.body);

  res.status(201).json(getResponseData(getUserDataWithoutPassword(user)));
});

app.put("/users/:id", validateUserBody, (req, res) => {
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
        `new user data: ${JSON.stringify(user)}`
      );

      res.json(getResponseData(getUserDataWithoutPassword(user)));
    }
  );
});

app.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const deletedUser = await removeUserTransaction(id);
  if (!deletedUser) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  console.log(
    `DELETE /users request performed. User ${deletedUser.id} has been deleted(soft)`
  );

  res.json(getResponseData(getUserDataWithoutPassword(deletedUser)));
});

app.get("/groups", (_, res) => {
  pool.query("SELECT * FROM groups", (error, results) => {
    if (error) {
      throw error;
    }

    const groups = results.rows;
    res.json(getResponseData(groups));
    console.log({ groups });
  });
});

app.get("/groups", (_, res) => {
  pool.query("SELECT * FROM groups", (error, results) => {
    if (error) {
      throw error;
    }

    const groups = results.rows;
    res.json(getResponseData(groups));
    console.log({ groups });
  });
});

app.get("/groups/:id", (req, res) => {
  const id = parseInt(req.params.id);
  pool.query("SELECT * FROM groups WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    const group = results.rows[0];
    if (!group) {
      console.log(`Group ${id} not found`);
      return res.status(404).json(getErrorResponseData("Group not found"));
    }

    console.log(`Group ${group.id} has been found`);

    res.status(200).json(getResponseData(group));
  });
});

app.post("/groups", validateGroupBody, async (req, res) => {
  const group = await addGroup(req.body);
  res.status(201).json(getResponseData(group));
});

app.put("/groups/:id", validateGroupBody, (req, res) => {
  const id = parseInt(req.params.id);
  const { name, permissions } = req.body;
  pool.query(
    "UPDATE groups SET name = $1, permissions = $2 WHERE id = $3 RETURNING *",
    [name, permissions, id],
    (error, results) => {
      if (error) {
        throw error;
      }

      const group = results.rows[0];

      console.log(
        `Group with id:${group.id} and name: ${group.name} has been updated`
      );

      res.status(200).json(getResponseData(group));
    }
  );
});

app.delete("/groups/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const deletedGroup = await removeGroupTransaction(id);
  if (deletedGroup) {
    console.log(
      `DELETE /groups request performed. Group ${deletedGroup.id} has been deleted`
    );

    res.status(200).json();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
