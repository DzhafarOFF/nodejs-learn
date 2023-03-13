import { PREFEDINED_GROUPS } from "./mock";

export const insertGroupsTableQuery =
  "INSERT INTO groups (name, permissions) VALUES ($1, $2) RETURNING *";
export const deleteGroupByIdQuery =
  "DELETE FROM groups WHERE id = $1 RETURNING *";
export const createGroupsTableQuery = `CREATE TABLE groups (id SERIAL PRIMARY KEY, name VARCHAR(50), permissions VARCHAR(50)[]);`;
export const insertPredefinedGroups = `INSERT INTO groups (name, permissions) VALUES ${PREFEDINED_GROUPS.map(
  (group) => `('${group.name}', '{${group.permissions}}')`
).join(",")}`;
export const selectAllGroups = "SELECT * FROM groups";
