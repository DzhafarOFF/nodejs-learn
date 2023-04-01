export interface IUser {
  id: string;
  login: string;
  password: string;
  age: number;
  is_deleted: boolean;
}
export interface IUserInputDTO
  extends Pick<IUser, "login" | "password" | "age"> {}
