import { v4 as uuidv4 } from "uuid";

export class User {
  id: string;
  login: string;
  password: string;
  age: number;
  is_deleted: boolean;

  constructor(login: string, password: string, age: number) {
    this.id = uuidv4();
    this.login = login;
    this.password = password;
    this.age = age;
    this.is_deleted = false;
  }
}