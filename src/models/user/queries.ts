import { PREDEFINED_USERS } from "./mock";

export const createUsersTableQuery = `CREATE TABLE users (id SERIAL PRIMARY KEY, login VARCHAR(50), password VARCHAR(50), age SMALLINT, is_deleted BOOLEAN);`;
export const insertPredefinedUsersQuery = `INSERT INTO users (login, password, age, is_deleted) VALUES ${PREDEFINED_USERS.map(
  (user) => `('${user.login}', '${user.password}', ${user.age}, false)`
).join(",")};`;
export const insertUserQuery =
  "INSERT INTO users (login, password, age, is_deleted) VALUES ($1, $2, $3, false) RETURNING *";
export const removeUserSoftByIdQuery =
  "UPDATE users SET is_deleted = true WHERE id = $1 RETURNING *";
export const selectAllUsersSortedByIdQuery =
  "SELECT * FROM users WHERE is_deleted = false ORDER BY id ASC";
export const selectUserByIdQuery = "SELECT * FROM users WHERE id = $1";
export const updateUserQuery =
  "UPDATE users SET login = $1, password = $2, age = $3 WHERE id = $4 RETURNING *";
export const selectAllUsers = "SELECT * FROM users";
