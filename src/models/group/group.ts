import { Pool } from "pg";
import { config } from "../../config";
import { UserGroupModel } from "../userGroup";
import {
  createGroupsTableQuery,
  deleteGroupByIdQuery,
  insertGroupsTableQuery,
  insertPredefinedGroups,
  selectAllGroups,
} from "./queries";
import { IGroup, IGroupInputDTO } from "./types";

const pool = new Pool({
  database: config.DATA_BASE_NAME,
  host: config.DATA_BASE_HOST,
  port: config.DATA_BASE_PORT,
});

export class GroupModel {
  static async init() {
    try {
      await pool.connect();
      await pool.query(createGroupsTableQuery);
      await pool.query(insertPredefinedGroups);
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async addGroup(group: IGroupInputDTO) {
    const { name, permissions } = group;

    try {
      await pool.connect();
      const groupQueryResult = await pool.query<IGroup>(
        insertGroupsTableQuery,
        [name, permissions]
      );
      const group = groupQueryResult.rows[0];

      console.log(`Group ${group.id} has been added`);

      return group;
    } catch (err) {
      throw err;
    } finally {
      await pool.end();
    }
  }

  static async deleteGroup(groupId: string): Promise<IGroup> {
    try {
      await pool.connect();
      await pool.query("BEGIN");
      const deletGroupQueryResult = await pool.query<IGroup>(
        deleteGroupByIdQuery,
        [groupId]
      );
      await UserGroupModel.removeUserGroupByGroupId(groupId);
      await pool.query("COMMIT");
      console.log("Group removed successfully!");
      const deletedGroup = deletGroupQueryResult.rows[0];
      return deletedGroup;
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    } finally {
      await pool.end();
    }
  }
  static async getGroups() {
    try {
      await pool.connect();
      const groupQueryResult = await pool.query<IGroup>(selectAllGroups);

      return groupQueryResult.rows;
    } catch (err) {
      throw err;
    } finally {
      await pool.end();
    }
  }
}
