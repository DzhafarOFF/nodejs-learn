import { RequestHandler } from "express";
import {
  getErrorResponseData,
  getResponseData,
  getUserDataWithoutPassword,
} from "../helpers";
import { GroupModel } from "../models/group";
import { UserModel } from "../models/user";

export const getAllUsersController: RequestHandler = async (req, res) => {
  const { loginSubstring, limit = 20 } = req.query;

  // TODO: throw erro if loginSubstring/limit is not string/number
  const users = await UserModel.getUsers(
    loginSubstring as string,
    limit as number
  );

  res.json(getResponseData(users));
};

export const getUserByIdController: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const user = await UserModel.getUserById(id);

  if (!user) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  res
    .status(200)
    .json({ success: true, data: getUserDataWithoutPassword(user) });
};

export const createUserController: RequestHandler = async (req, res) => {
  const groupsResult = await GroupModel.getGroups();

  const readAndWriteGroup = groupsResult[1]; // default assignment to read and write group

  const user = await UserModel.addUser(req.body, readAndWriteGroup.id);

  res.status(201).json(getResponseData(getUserDataWithoutPassword(user)));
};

export const updateUserController: RequestHandler = async (req, res) => {
  const id = req.params.id;

  const user = await UserModel.updateUser(req.body, id);

  if (!user) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  res.json(getResponseData(getUserDataWithoutPassword(user)));
};

export const deleteUserController: RequestHandler = async (req, res) => {
  const id = req.params.id;

  const deletedUser = await UserModel.deleteUser(id);

  if (!deletedUser) {
    return res.status(404).json(getErrorResponseData("User not found"));
  }

  res.json(getResponseData(getUserDataWithoutPassword(deletedUser)));
};
