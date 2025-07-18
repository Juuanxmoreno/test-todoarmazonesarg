import { UserRole, UserStatus } from "@/enums/user.enum";

export interface IUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;

  // For user list and details
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetUsersPaginatedResponse {
  users: IUser[];
  nextCursor: string | null;
}