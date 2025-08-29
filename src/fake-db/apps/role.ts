import type { RoleType } from "@/types/apps/roleType";

export const db: RoleType[] = [
  { id: "1", totalUsers: 4, title: 'Administrator', avatars: ['1.png', '2.png', '3.png', '4.png'], permission: [], permissions: [] },
  { id: "2", totalUsers: 7, title: 'Editor', avatars: ['5.png', '6.png', '7.png'], permission: [], permissions: [] },
  { id: "3", totalUsers: 5, title: 'Users', avatars: ['4.png', '5.png', '6.png'], permission: [], permissions: [] },
  { id: "4", totalUsers: 6, title: 'Support', avatars: ['1.png', '2.png', '3.png'], permission: [], permissions: [] },
  { id: "5", totalUsers: 10, title: 'Restricted User', avatars: ['4.png', '5.png', '6.png'], permission: [], permissions: [] }
]
