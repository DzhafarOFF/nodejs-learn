import { EPermission, IGroup } from "./types";

export const PREFEDINED_GROUPS: Array<Pick<IGroup, "name" | "permissions">> = [
  {
    name: "user_read_only",
    permissions: [EPermission.READ, EPermission.SHARE],
  },
  {
    name: "user_read_write",
    permissions: [EPermission.READ, EPermission.SHARE, EPermission.WRITE],
  },
  {
    name: "user_admin",
    permissions: [
      EPermission.READ,
      EPermission.SHARE,
      EPermission.WRITE,
      EPermission.DELETE,
      EPermission.UPLOAD_FILES,
    ],
  },
];
