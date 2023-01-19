import { User } from "./user";

export const getFilteredAndSortedUsersLogin = (
  users: User[],
  searchString: string,
  limit: number
) => {
  return users
    .filter((user) => user.login.includes(searchString) && !user.isDeleted)
    .sort((a, b) => a.login.localeCompare(b.login))
    .slice(0, limit)
    .map((user) => user.login);
};

export const getUserDataWithoutPassword = ({
  password,
  ...safeUserData
}: User) => ({ ...safeUserData });

export const getErrorResponseData = (message: string) => {
  return { success: false, error: { message } };
};

export const getResponseData = (data: any) => {
  return { success: true, data };
};
