import { RequestHandler } from "express";
import { getResponseData } from "../helpers";
import { GroupModel } from "../models/group";

export const getAllGroupsController: RequestHandler = async (_, res) => {
  const groups = await GroupModel.getGroups();

  res.json(getResponseData(groups));
};
export const getGroupByIDController: RequestHandler = async (req, res) => {
  const group = GroupModel.getGroupByID(req.params.id);
  res.status(200).json(getResponseData(group));
};
export const createGroupController: RequestHandler = async (req, res) => {
  const group = await GroupModel.addGroup(req.body);
  res.status(201).json(getResponseData(group));
};

export const updateGroupController: RequestHandler = async (req, res) => {
  const { name, permissions } = req.body;
  const group = await GroupModel.updateGroupByID(
    req.params.id,
    name,
    permissions
  );
  res.status(200).json(getResponseData(group));
};

export const deleteGroupController: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const deletedGroup = await GroupModel.deleteGroup(id);
  if (deletedGroup) {
    res.status(200).json();
  }
};
