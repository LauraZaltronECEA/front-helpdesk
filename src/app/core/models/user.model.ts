export interface UserListResponse {
  userId: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  active: number;
}

export interface UpdateUserRoleDTO {
  role: string;
}

export interface UpdateUserAreaDTO {
  areaId?: number | null;
}
