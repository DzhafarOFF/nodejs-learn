import { Client, Pool } from "pg";
import { config } from "../config";
import { GroupModel } from "../models/group";
import { UserModel } from "../models/user";
import { UserGroupModel } from "../models/userGroup";

const dropDatabaseQueryIfExist = `DROP DATABASE IF EXISTS ${config.DATA_BASE_NAME};`;
const createDatabaseQuery = `CREATE DATABASE ${config.DATA_BASE_NAME};`;

export const createDB = async () => {
  const client = new Client({
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });

  try {
    await client.connect();
    await client.query(dropDatabaseQueryIfExist);

    const pool = new Pool({
      database: config.DATA_BASE_NAME,
      host: config.DATA_BASE_HOST,
      port: config.DATA_BASE_PORT,
    });

    await client.query(createDatabaseQuery);

    await UserModel.init();
    await GroupModel.init();
    await UserGroupModel.init();

    try {
      await pool.query("BEGIN");

      const usersResult = await UserModel.getAllUsers();

      const groupsResult = await GroupModel.getGroups();

      const readAndWriteGroup = groupsResult[1];

      const usersIds = usersResult.map((user) => user.id);

      await UserGroupModel.addUsersToGroup(readAndWriteGroup.id, usersIds);

      await pool.query("COMMIT");
    } catch (error) {
      throw error;
    }

    await pool.end();
    await client.end();
  } catch (error: any) {
    throw error;
  }
};
