import { Pool } from "pg";
import { config } from "../../config";
import {
  createUsersGroupsTableQuery,
  deleteUsersGroupsTableByGrpupIdQuery,
  deleteUsersGroupsTableByUserIdQuery,
  insertUsersGroupsTableQuery,
} from "./queries";

const pool = new Pool({
  database: config.DATA_BASE_NAME,
  host: config.DATA_BASE_HOST,
  port: config.DATA_BASE_PORT,
});

export class UserGroupModel {
  static async init() {
    try {
      await pool.connect();
      await pool.query(createUsersGroupsTableQuery);
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }
  static async addUserGroup(userId: string, groupId: string): Promise<void> {
    try {
      await pool.connect();
      await pool.query(insertUsersGroupsTableQuery, [userId, groupId]);
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async removeUserGroupByUserId(userId: string): Promise<void> {
    try {
      await pool.connect();
      await pool.query(deleteUsersGroupsTableByUserIdQuery, [userId]);
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async removeUserGroupByGroupId(groupId: string): Promise<void> {
    try {
      await pool.connect();
      await pool.query(deleteUsersGroupsTableByGrpupIdQuery, [groupId]);
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }
  static async addUserToGroup(
    userId: string,
    groupId: string,
    pool: Pool
  ): Promise<void> {
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
  }

  static async addUsersToGroup(groupId: string, usersIds: string[]) {
    try {
      await pool.connect();

      for (const userId of usersIds) {
        await UserGroupModel.addUserToGroup(userId, groupId, pool);
      }

      console.log("FINISH: Users assigned to provided groups");
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }
}
