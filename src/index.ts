import express, { NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import { config } from "./config";
import {
  getErrorResponseData,
  getResponseData,
  getUserDataWithoutPassword,
} from "./helpers";
import { createDB } from "./loaders";
import { apiErrorLoggerMiddleware, apiLoggerMiddleware } from "./loggers";
import { GroupModel } from "./models/group";
import { UserModel } from "./models/user";
import {
  validateGroupBody,
  validateUseLogin,
  validateUserBody,
} from "./validation";
import jwt from "jsonwebtoken";
import cors from "cors";
import { jwtMiddleware } from "./auth";

createDB();

const PORT = 3000;

const app = express();

const pool = new Pool({
  database: config.DATA_BASE_NAME,
  host: "localhost",
  port: 5432,
});

app.use(express.json());
app.use(cors());
app.use(jwtMiddleware);
app.use(apiLoggerMiddleware);

app.get("/users", async (req, res) => {
  const { loginSubstring, limit = 20 } = req.query;

  // TODO: throw erro if loginSubstring/limit is not string/number
  const users = await UserModel.getUsers(
    loginSubstring as string,
    limit as number
  );

  res.json(getResponseData(users));
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await UserModel.getUserById(id);

  if (!user) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  res
    .status(200)
    .json({ success: true, data: getUserDataWithoutPassword(user) });
});

app.post("/users", validateUserBody, async (req, res) => {
  const groupsResult = await GroupModel.getGroups();

  const readAndWriteGroup = groupsResult[1]; // default assignment to read and write group

  const user = await UserModel.addUser(req.body, readAndWriteGroup.id);

  res.status(201).json(getResponseData(getUserDataWithoutPassword(user)));
});

app.put("/users/:id", validateUserBody, async (req, res) => {
  const id = req.params.id;

  const user = await UserModel.updateUser(req.body, id);

  if (!user) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  res.json(getResponseData(getUserDataWithoutPassword(user)));
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;

  const deletedUser = await UserModel.deleteUser(id);

  if (!deletedUser) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  `DELETE /users request performed. User ${deletedUser.id} has been deleted(soft)`;

  res.json(getResponseData(getUserDataWithoutPassword(deletedUser)));
});

app.get("/groups", (_, res) => {
  pool.query("SELECT * FROM groups", (error, results) => {
    if (error) {
      throw error;
    }

    const groups = results.rows;
    res.json(getResponseData(groups));
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
      return res.status(404).json(getErrorResponseData("Group not found"));
    }

    res.status(200).json(getResponseData(group));
  });
});

app.post("/groups", validateGroupBody, async (req, res) => {
  const group = await GroupModel.addGroup(req.body);
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

      res.status(200).json(getResponseData(group));
    }
  );
});

app.delete("/groups/:id", async (req, res) => {
  const id = req.params.id;
  const deletedGroup = await GroupModel.deleteGroup(id);
  if (deletedGroup) {
    res.status(200).json();
  }
});
// Login method
app.post("/login", validateUseLogin, async (req, res) => {
  const { login, password } = req.body;

  const user = await UserModel.getUserByLoginAndPassword(login, password);

  if (user) {
    const token = jwt.sign({ id: user.id }, config.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({ success: true, token });
  } else {
    res.status(401).json(getErrorResponseData("Invalid username or password"));
  }
});

app.use(apiErrorLoggerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
