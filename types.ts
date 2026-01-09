export enum UserRole {
  USER = 'user',
  EDITOR = 'editor',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: string;
  email: string;
  password?: string; // In a real app, never store plain text. Used here for demo simplicity with JSON.
  role: UserRole;
  deviceId?: string; // For device locking
  isPremium: boolean;
  bookmarks: string[]; // Manhua IDs
  favorites: string[]; // Manhua IDs
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: string[]; // URLs to images
  isPremium: boolean;
  createdAt: string;
}

export interface Manhua {
  id: string;
  title: string;
  coverUrl: string;
  description: string;
  genre: string[];
  status: 'ongoing' | 'completed';
  isPremiumOnly: boolean;
  chapters: Chapter[];
  views: number;
}

export interface AppData {
  users: User[];
  manhuas: Manhua[];
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
  sha?: string; // Needed for updates
}

export const INITIAL_DATA: AppData = {
  users: [
    {
      id: 'admin-1',
      email: 'admin@kurdmanhua.com',
      password: 'admin',
      role: UserRole.SUPER_ADMIN,
      isPremium: true,
      bookmarks: [],
      favorites: []
    }
  ],
  manhuas: [
    {
      id: 'm1',
      title: 'Solo Leveling (سۆلۆ لێڤڵینگ)',
      coverUrl: 'https://picsum.photos/300/450',
      description: 'دەرگایەک دەکرێتەوە بۆ جیهانێکی پڕ لە ئەژدیها و جادوو...',
      genre: ['Action', 'Fantasy'],
      status: 'completed',
      isPremiumOnly: false,
      views: 120500,
      chapters: [
        {
          id: 'c1',
          number: 1,
          title: 'بەشی یەکەم',
          isPremium: false,
          createdAt: new Date().toISOString(),
          pages: [
            'https://picsum.photos/600/900?random=1',
            'https://picsum.photos/600/900?random=2',
            'https://picsum.photos/600/900?random=3'
          ]
        },
         {
          id: 'c2',
          number: 2,
          title: 'بەشی دووەم',
          isPremium: true,
          createdAt: new Date().toISOString(),
          pages: [
            'https://picsum.photos/600/900?random=4',
            'https://picsum.photos/600/900?random=5'
          ]
        }
      ]
    }
  ]
};