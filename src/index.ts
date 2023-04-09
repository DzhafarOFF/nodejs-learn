import express from "express";
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
import {
  createGroupController,
  createUserController,
  deleteGroupController,
  deleteUserController,
  getAllGroupsController,
  getAllUsersController,
  getGroupByIDController,
  getUserByIdController,
  updateUserController,
} from "./controllers";

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

app.get("/users", getAllUsersController);

app.get("/users/:id", getUserByIdController);

app.post("/users", validateUserBody, createUserController);

app.put("/users/:id", validateUserBody, updateUserController);

app.delete("/users/:id", deleteUserController);

app.get("/groups", getAllGroupsController);

app.get("/groups/:id", getGroupByIDController);

app.post("/groups", validateGroupBody, createGroupController);

app.put("/groups/:id", validateGroupBody);

app.delete("/groups/:id", deleteGroupController);

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
