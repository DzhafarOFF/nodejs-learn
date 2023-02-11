type Permission = "READ" | "WRITE" | "DELETE" | "SHARE" | "UPLOAD_FILES";

interface Group {
  id: string;
  name: string;
  permissions: Permission[];
}
