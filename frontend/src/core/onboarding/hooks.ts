/**
 * Onboarding React Query hooks for DeerFlow Electron platform.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "./api";
import type { OnboardingUpdate, ProviderApiKeys } from "./types";

export const ONBOARDING_KEYS = {
  state: ["onboarding"] as const,
  status: ["onboarding", "status"] as const,
  apiKeys: ["onboarding", "api-keys"] as const,
};

export function useOnboarding() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.state,
    queryFn: api.getOnboarding,
    staleTime: 30 * 1000,
  });
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.status,
    queryFn: api.getOnboardingStatus,
    staleTime: 10 * 1000,
  });
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: OnboardingUpdate) => api.updateOnboarding(update),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEYS.state, data);
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.completeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEYS.state, data);
      queryClient.setQueryData(ONBOARDING_KEYS.status, {
        completed: data.completed,
        currentStep: data.currentStep,
      });
    },
  });
}

export function useResetOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.resetOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEYS.state, data);
      queryClient.setQueryData(ONBOARDING_KEYS.status, {
        completed: data.completed,
        currentStep: data.currentStep,
      });
    },
  });
}

export function useProviderApiKeys() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.apiKeys,
    queryFn: api.getProviderApiKeys,
    staleTime: 60 * 1000,
  });
}

export function useSaveProviderApiKeys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keys: ProviderApiKeys) => api.saveProviderApiKeys(keys),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEYS.apiKeys, data);
    },
  });
}