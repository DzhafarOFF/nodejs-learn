import { Client, Pool, types } from "pg";
import { config } from "../config";

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

const dropDatabaseQueryIfExist = `DROP DATABASE IF EXISTS ${config.DATA_BASE_NAME};`;
const createDatabaseQuery = `CREATE DATABASE ${config.DATA_BASE_NAME};`;
const createUsersTableQuery = `CREATE TABLE users (id SERIAL PRIMARY KEY, login VARCHAR(50), password VARCHAR(50), age SMALLINT, is_deleted BOOLEAN);`;
const insertPredifinedUsersQuery = `INSERT INTO users (login, password, age, is_deleted) VALUES ${PREDEFINED_USERS.map(
  (user) => `('${user.login}', '${user.password}', ${user.age}, false),`
)};`;

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
      host: "localhost",
      port: 5432,
    });

    await client.query(createDatabaseQuery);
    await pool.query(createUsersTableQuery);
    await pool
      .query(insertPredifinedUsersQuery)
      .then((res) => {
        console.log("GOOD", res);
        pool.end();
      })
      .catch(logError);
    await client.end();
  } catch (error: any) {
    logError(error);
  }
};
