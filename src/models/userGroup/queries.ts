export const createUsersGroupsTableQuery = `CREATE TABLE users_groups (
    user_id INT REFERENCES users(id),
    group_id INT REFERENCES groups(id),
    PRIMARY KEY (user_id, group_id)
  );`;

export const insertUsersGroupsTableQuery =
  "INSERT INTO users_groups (user_id, group_id) VALUES ($1, $2) RETURNING *";

export const deleteUsersGroupsTableByUserIdQuery =
  "DELETE FROM users_groups WHERE user_id = $1";

export const deleteUsersGroupsTableByGrpupIdQuery =
  "DELETE FROM users_groups WHERE group_id = $1";
