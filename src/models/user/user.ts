import { Pool } from "pg";
import { config } from "../../config";
import { getFilteredAndSortedUsersLogin } from "../../helpers";
import { UserGroupModel } from "../userGroup";
import {
  createUsersTableQuery,
  insertPredefinedUsersQuery,
  insertUserQuery,
  removeUserSoftByIdQuery,
  selectAllUsers,
  selectAllUsersSortedByIdQuery,
  selectUserByIdQuery,
  updateUserQuery,
} from "./queries";
import { IUser, IUserInputDTO } from "./types";

const pool = new Pool({
  database: config.DATA_BASE_NAME,
  host: config.DATA_BASE_HOST,
  port: config.DATA_BASE_PORT,
});

export class UserModel {
  static async init() {
    try {
      await pool.connect();
      await pool.query(createUsersTableQuery);
      await pool.query(insertPredefinedUsersQuery);
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async addUser(user: IUserInputDTO, groupId: string): Promise<IUser> {
    const { login, password, age } = user;

    try {
      await pool.connect();
      await pool.query("BEGIN");
      const userQueryResult = await pool.query<IUser>(insertUserQuery, [
        login,
        password,
        age,
      ]);
      const user = userQueryResult.rows[0];
      await UserGroupModel.addUserGroup(user.id, groupId);
      await pool.query("COMMIT");

      console.log(`IUser ${user.id} has been added`);

      return user;
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    } finally {
      await pool.end();
    }
  }

  static async updateUser(
    userInput: IUserInputDTO,
    id: string
  ): Promise<IUser> {
    const { login, password, age } = userInput;

    try {
      await pool.connect();
      const queryResult = await pool.query(updateUserQuery, [
        login,
        password,
        age,
        id,
      ]);

      return queryResult.rows[0];
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async deleteUser(userId: string): Promise<IUser> {
    try {
      await pool.connect();
      await pool.query("BEGIN");
      const deletUserQueryResult = await pool.query<IUser>(
        removeUserSoftByIdQuery,
        [userId]
      );
      await UserGroupModel.removeUserGroupByUserId(userId);
      await pool.query("COMMIT");

      console.log("User removed(soft) successfully!");

      const deletedUser = deletUserQueryResult.rows[0];

      return deletedUser;
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    } finally {
      await pool.end();
    }
  }

  static async getUserById(id: string): Promise<IUser> {
    try {
      await pool.connect();
      const queryResults = await pool.query(selectUserByIdQuery, [id]);
      const user = queryResults.rows[0];

      return user;
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async getUsers(
    loginSubstring?: string,
    limit?: number
  ): Promise<string[]> {
    try {
      await pool.connect();
      const queryResults = await pool.query(selectAllUsersSortedByIdQuery);
      const users = queryResults.rows;
      if (!loginSubstring) {
        const limitedUsers = users
          .slice(0, limit as number)
          .map((user) => user.login);

        return limitedUsers;
      } else {
        const usersLoginArray = getFilteredAndSortedUsersLogin(
          users,
          loginSubstring as string,
          limit as number
        );

        return usersLoginArray;
      }
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }

  static async getAllUsers(): Promise<IUser[]> {
    try {
      await pool.connect();
      const queryResults = await pool.query(selectAllUsers);
      const users = queryResults.rows;
      return users;
    } catch (e) {
      throw e;
    } finally {
      await pool.end();
    }
  }
}
