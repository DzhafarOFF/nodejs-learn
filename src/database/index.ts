import { Client, Pool } from "pg";
import { config } from "../config";
import { Group, Permission } from "../group";
import { User } from "../user";

const logError = (err: Error) => {
  console.log(err);
};

enum EOperationsDatabase {
  DROP_DATABASE = "DROP DATABASE",
  CREATE_DATABASE = "CREATE DATABASE",
}

enum EOperationsTable {
  CREATE_TABLE = "CREATE TABLE",
}

const PREDEFINED_USERS = [
  { login: "User1", password: "password1", age: 21 },
  { login: "User2", password: "password2", age: 22 },
  { login: "User3", password: "password3", age: 18 },
  { login: "User4", password: "password4", age: 22 },
];

const PREFEDINED_GROUPS: Array<Pick<Group, "name" | "permissions">> = [
  { name: "user_read_only", permissions: [Permission.READ, Permission.SHARE] },
  {
    name: "user_read_write",
    permissions: [Permission.READ, Permission.SHARE, Permission.WRITE],
  },
  {
    name: "user_admin",
    permissions: [
      Permission.READ,
      Permission.SHARE,
      Permission.WRITE,
      Permission.DELETE,
      Permission.UPLOAD_FILES,
    ],
  },
];

const dropDatabaseQueryIfExist = `DROP DATABASE IF EXISTS ${config.DATA_BASE_NAME};`;
const createDatabaseQuery = `CREATE DATABASE ${config.DATA_BASE_NAME};`;
const createUsersTableQuery = `CREATE TABLE users (id SERIAL PRIMARY KEY, login VARCHAR(50), password VARCHAR(50), age SMALLINT, is_deleted BOOLEAN);`;
const insertPredefinedUsersQuery = `INSERT INTO users (login, password, age, is_deleted) VALUES ${PREDEFINED_USERS.map(
  (user) => `('${user.login}', '${user.password}', ${user.age}, false)`
).join(",")};`;
const createGroupsTableQuery = `CREATE TABLE groups (id SERIAL PRIMARY KEY, name VARCHAR(50), permissions VARCHAR(50)[]);`;
const insertPredefinedGroups = `INSERT INTO groups (name, permissions) VALUES ${PREFEDINED_GROUPS.map(
  (group) => `('${group.name}', '{${group.permissions}}')`
).join(",")}`;
const createUsersGroupsTableQuery = `CREATE TABLE users_groups (
  user_id INT REFERENCES users(id),
  group_id INT REFERENCES groups(id),
  PRIMARY KEY (user_id, group_id)
);`;

const insertUsersGroupsTableQuery =
  "INSERT INTO users_groups (user_id, group_id) VALUES ($1, $2) RETURNING *";
export const selectUserByIdQuery = "SELECT * FROM users WHERE id = $1";
export const deleteUsersGroupsTableByUserIdQuery =
  "DELETE FROM users_groups WHERE user_id = $1";

const addUserToGroup = async (userId: string, groupId: string, pool: Pool) => {
  try {
    await pool.query("BEGIN");
    await pool.query(deleteUsersGroupsTableByUserIdQuery, [userId]);
    const usersGroupsQueryResult = await pool.query(
      insertUsersGroupsTableQuery,
      [userId, groupId]
    );
    const userGroupData = usersGroupsQueryResult.rows[0];
    console.log(
      `New user-group relation created user id:${userGroupData.user_id} group id:${userGroupData.group_id}`
    );
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
};

const addUsersToGroup = async (groupId: string, usersIds: string[]) => {
  const pool = new Pool({
    database: config.DATA_BASE_NAME,
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });

  await pool.connect();

  for (const userId of usersIds) {
    await addUserToGroup(userId, groupId, pool);
  }

  console.log("FINISH: Users assigned to provided groups");

  await pool.end();
};

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
    await pool.query(createUsersTableQuery);
    await pool.query(insertPredefinedUsersQuery);
    await pool.query(createGroupsTableQuery);
    await pool.query(insertPredefinedGroups);
    await pool.query(createUsersGroupsTableQuery);
    try {
      await pool.query("BEGIN");

      const usersResult = await pool.query<User>("SELECT * FROM users");

      const groupsResult = await pool.query<Group>("SELECT * FROM groups");

      const readAndWriteGroup = groupsResult.rows[1];

      const usersIds = usersResult.rows.map((user) => user.id);

      await addUsersToGroup(readAndWriteGroup.id, usersIds);

      await pool.query("COMMIT");
    } catch (error) {
      console.log({ error });
      throw error;
    }

    await pool.end();
    await client.end();
  } catch (error: any) {
    logError(error);
  }
};

export const removeUserTransaction = async (userId: number) => {
  const pool = new Pool({
    database: config.DATA_BASE_NAME,
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });

  await pool.connect();

  try {
    await pool.query("BEGIN");
    const deletUserQueryResult = await pool.query<User>(
      "UPDATE users SET is_deleted = true WHERE id = $1 RETURNING *",
      [userId]
    );
    await pool.query(deleteUsersGroupsTableByUserIdQuery, [userId]);
    await pool.query("COMMIT");
    console.log("User removed(soft) successfully!");
    const deletedUser = deletUserQueryResult.rows[0];
    return deletedUser;
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error removing user:", err);
  } finally {
    await pool.end(); // close database connection
  }
};

const insertUserQuery =
  "INSERT INTO users (login, password, age, is_deleted) VALUES ($1, $2, $3, false) RETURNING *";

export const addUserTransaction = async (
  user: Pick<User, "login" | "password" | "age">,
  groupId: number = 2
) => {
  const { login, password, age } = user;

  const pool = new Pool({
    database: config.DATA_BASE_NAME,
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });
  try {
    await pool.connect();
    await pool.query("BEGIN");
    const userQueryResult = await pool.query<User>(insertUserQuery, [
      login,
      password,
      age,
    ]);
    const user = userQueryResult.rows[0];
    await pool.query(insertUsersGroupsTableQuery, [user.id, groupId]);
    await pool.query("COMMIT");

    console.log(`User ${user.id} has been added`);

    return user;
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
};
const insertGroupsTableQuery =
  "INSERT INTO groups (name, permissions) VALUES ($1, $2) RETURNING *";

export const addGroup = async (group: Group) => {
  const { name, permissions } = group;

  const pool = new Pool({
    database: config.DATA_BASE_NAME,
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });

  try {
    await pool.connect();
    const groupQueryResult = await pool.query<Group>(insertGroupsTableQuery, [
      name,
      permissions,
    ]);
    const group = groupQueryResult.rows[0];

    console.log(`Group ${group.id} has been added`);

    return group;
  } catch (err) {
    throw err;
  }
};
export const removeGroupTransaction = async (groupId: number) => {
  const pool = new Pool({
    database: config.DATA_BASE_NAME,
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });

  await pool.connect();

  try {
    await pool.query("BEGIN");
    const deletGroupQueryResult = await pool.query<Group>(
      "DELETE FROM groups WHERE id = $1 RETURNING *",
      [groupId]
    );
    await pool.query("DELETE FROM users_groups WHERE group_id = $1", [groupId]);
    await pool.query("COMMIT");
    console.log("Group removed successfully!");
    const deletedGroup = deletGroupQueryResult.rows[0];
    return deletedGroup;
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error removing group:", err);
  } finally {
    await pool.end();
  }
};
