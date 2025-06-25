import { UserRole, UserStatus } from "@/enums/user.enum";

export interface IUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
