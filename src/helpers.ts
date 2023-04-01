import { IUser } from "./models/user";

export const getFilteredAndSortedUsersLogin = (
  users: IUser[],
  searchString: string,
  limit: number
) => {
  return users
    .filter((user) => user.login.includes(searchString) && !user.is_deleted)
    .sort((a, b) => a.login.localeCompare(b.login))
    .slice(0, limit)
    .map((user) => user.login);
};

export const getUserDataWithoutPassword = ({
  password,
  ...safeUserData
}: IUser) => ({ ...safeUserData });

export const getErrorResponseData = (message: string) => {
  return { success: false, error: { message } };
};

export const getResponseData = (data: any) => {
  return { success: true, data };
};
