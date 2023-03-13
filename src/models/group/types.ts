export enum EPermission {
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
  SHARE = "SHARE",
  UPLOAD_FILES = "UPLOAD_FILES",
}

export interface IGroup {
  id: string;
  name: string;
  permissions: EPermission[];
}
export interface IGroupInputDTO extends Pick<IGroup, "name" | "permissions"> {}
