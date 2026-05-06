export type MarketplaceType = "agent" | "plugin" | "skill" | "template";
export type InstallStatus =
  | "not_installed"
  | "installed"
  | "installing"
  | "updating"
  | "uninstalling"
  | "error";
export type SortBy = "popular" | "rated" | "recent" | "name";
export type ItemSource = "builtin" | "community" | "local";

export interface CompatibilityInfo {
  minAppVersion: string;
  platforms: string[];
}

export interface DependencyInfo {
  id: string;
  versionRange: string;
  optional: boolean;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  type: MarketplaceType;
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  ratingCount: number;
  installStatus: InstallStatus;
  installedVersion?: string;
  updatedAt: string;
  size: number;
  compatibility: CompatibilityInfo;
  dependencies: DependencyInfo[];
  permissions: string[];
  hooks: string[];
  source: ItemSource;
}

export interface MarketplaceItemsResponse {
  items: MarketplaceItem[];
  total: number;
}

export interface MarketplaceStats {
  totalItems: number;
  installedCount: number;
  totalPlugins: number;
  totalSkills: number;
  totalTemplates: number;
  totalAgents: number;
}

export interface MarketplaceCategoriesResponse {
  categories: string[];
}

export interface MarketplaceFilter {
  type?: string;
  category?: string;
  search?: string;
  sortBy?: SortBy;
}
