import { useQuery } from "@tanstack/react-query";

import {
  getMarketplaceCategories,
  getMarketplaceItems,
  getMarketplaceStats,
} from "./api";
import type { MarketplaceFilter } from "./types";

export function useMarketplaceItems(filter?: MarketplaceFilter) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["marketplace", "items", filter],
    queryFn: () => getMarketplaceItems(filter),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  return { data: data ?? null, isLoading, error, refresh: refetch };
}

export function useMarketplaceStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["marketplace", "stats"],
    queryFn: getMarketplaceStats,
    refetchOnWindowFocus: false,
    staleTime: 120_000,
  });
  return { data: data ?? null, isLoading, error, refresh: refetch };
}

export function useMarketplaceCategories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: getMarketplaceCategories,
    refetchOnWindowFocus: false,
    staleTime: 300_000,
  });
  return { data: data ?? null, isLoading, error };
}
