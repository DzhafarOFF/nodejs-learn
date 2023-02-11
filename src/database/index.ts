import { Client, Pool } from "pg";
import { config } from "../config";

const logError = (err: Error) => {
  console.log(err);
};

export const createDB = () => {
  const client = new Client({
    host: config.DATA_BASE_HOST,
    port: config.DATA_BASE_PORT,
  });
  console.log({ config });
  client.connect().then(() => {
    client
      .query(`DROP DATABASE IF EXISTS ${config.DATA_BASE_NAME};`)
      .then(() => {
        client.query(`CREATE DATABASE ${config.DATA_BASE_NAME};`).then(() => {
          const pool = new Pool({
            database: config.DATA_BASE_NAME,
            host: "localhost",
            port: 5432,
          });
          pool
            .query(
              `CREATE TABLE users (id SERIAL PRIMARY KEY, login VARCHAR(50), password VARCHAR(50), age SMALLINT, is_deleted BOOLEAN); INSERT INTO users (login, password, age, is_deleted) VALUES ('User1', 'password1', 21, false), ('User2', 'password2', 22, false), ('User3', 'password3', 18, false), ('User4', 'password4', 22, false);`
            )
            .then((res) => {
              console.log("GOOD", res);
              pool.end();
            })
            .catch(logError);
          client.end();
        });
      })
      .catch(logError);
  });
};
