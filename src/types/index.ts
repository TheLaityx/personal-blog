export interface ModuleItem {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
  wallpaper?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CollectionItem {
  id: number;
  name: string;
  description?: string | null;
  wallpaper?: string | null;
  sortOrder: number;
  moduleId: number;
  createdAt: Date;
}

export interface ArticleItem {
  id: number;
  title?: string | null;
  content?: string | null;
  coverImage?: string | null;
  moduleId: number;
  collectionId?: number | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentItem {
  id: number;
  content: string;
  author: string;
  email?: string | null;
  articleId?: number | null;
  parentId?: number | null;
  isApproved: boolean;
  createdAt: Date;
  replies?: CommentItem[];
}

export interface SiteConfigItem {
  id: number;
  key: string;
  value: string;
  updatedAt: Date;
}
