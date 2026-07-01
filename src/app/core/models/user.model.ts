export interface UserListResponse {
  userId: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  area: string;
  areaId?: number | null;
  active: number;
}

export interface UpdateUserRoleDTO {
  role: string;
}

export interface UpdateUserAreaDTO {
  areaId?: number | null;
}
