/**
 * Onboarding API for DeerFlow Electron platform.
 */

import type { OnboardingState, OnboardingStatus, OnboardingUpdate, ProviderApiKeys } from "./types";

const BASE = `/api/onboarding`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${path.startsWith("/") ? "" : BASE}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getOnboarding(): Promise<OnboardingState> {
  return (await fetchJson(BASE)) as OnboardingState;
}

export async function updateOnboarding(update: OnboardingUpdate): Promise<OnboardingState> {
  return (await fetchJson(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  })) as OnboardingState;
}

export async function completeOnboarding(): Promise<OnboardingState> {
  return (await fetchJson(`${BASE}/complete`, { method: "POST" })) as OnboardingState;
}

export async function resetOnboarding(): Promise<OnboardingState> {
  return (await fetchJson(`${BASE}/reset`, { method: "POST" })) as OnboardingState;
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return (await fetchJson(`${BASE}/status`)) as OnboardingStatus;
}

export async function saveProviderApiKeys(keys: ProviderApiKeys): Promise<ProviderApiKeys> {
  return (await fetchJson(`${BASE}/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(keys),
  })) as ProviderApiKeys;
}

export async function getProviderApiKeys(): Promise<ProviderApiKeys> {
  return (await fetchJson(`${BASE}/api-keys`)) as ProviderApiKeys;
}