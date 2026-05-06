import { getBackendBaseURL } from "@/core/config";
import type {
  MarketplaceCategoriesResponse,
  MarketplaceFilter,
  MarketplaceItemsResponse,
  MarketplaceStats,
} from "./types";

export async function getMarketplaceItems(
  filter?: MarketplaceFilter
): Promise<MarketplaceItemsResponse> {
  const params = new URLSearchParams();
  if (filter?.type) params.set("type", filter.type);
  if (filter?.category) params.set("category", filter.category);
  if (filter?.search) params.set("search", filter.search);
  if (filter?.sortBy) params.set("sortBy", filter.sortBy);

  const qs = params.toString();
  const url = `${getBackendBaseURL()}/api/marketplace/items${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch marketplace items" }));
    throw new Error((err as { detail?: string }).detail ?? "Unknown error");
  }
  return res.json() as Promise<MarketplaceItemsResponse>;
}

export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const res = await fetch(`${getBackendBaseURL()}/api/marketplace/stats`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch marketplace stats" }));
    throw new Error((err as { detail?: string }).detail ?? "Unknown error");
  }
  return res.json() as Promise<MarketplaceStats>;
}

export async function getMarketplaceCategories(): Promise<MarketplaceCategoriesResponse> {
  const res = await fetch(`${getBackendBaseURL()}/api/marketplace/categories`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch marketplace categories" }));
    throw new Error((err as { detail?: string }).detail ?? "Unknown error");
  }
  return res.json() as Promise<MarketplaceCategoriesResponse>;
}
