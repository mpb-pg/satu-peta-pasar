import type { LucideIcon } from 'lucide-react';

// User data types
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
};

// Navigation item types (following shadcn pattern)
export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};
