import { Client, Pool } from "pg";
import { config } from "../config";
import { GroupModel } from "../models/group";
import { UserModel } from "../models/user";
import { UserGroupModel } from "../models/userGroup";

const logError = (err: Error) => {
  console.log(err);
};

const dropDatabaseQueryIfExist = `DROP DATABASE IF EXISTS ${config.DATA_BASE_NAME};`;
const createDatabaseQuery = `CREATE DATABASE ${config.DATA_BASE_NAME};`;

export const createDB = async () => {
  const client = new Client({
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });

  console.log({ config });

  try {
    await client.connect().catch(logError);
    await client.query(dropDatabaseQueryIfExist).catch(logError);

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
    logError(error);
  }
};
