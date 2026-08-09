import type { Location } from "./location";

// Профіль користувача, який повертає сервер
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;

  bio?: string;
  location?: Location;

  avatarUrl?: string;
  bannerUrl?: string;
  
  followersCount: number;
  followingCount: number;
  createdAt: string;
}
