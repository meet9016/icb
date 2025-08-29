/* eslint-disable @typescript-eslint/no-unused-vars */
import { PermissionRowType } from "./permissionTypes"



export type SubMenus = {
  id: number;
  name: string;
}

export type Permissions = {
  menu_id: number;
  menu_name: string;
  sub_menus: SubMenus[];
  permissions: Permissions[]

}
export type RoleType = {
  id: string
  title: string
  avatars: string[]
  totalUsers: number
  permissions: Permissions[]
  permission: string[]
}
export type id = any 
