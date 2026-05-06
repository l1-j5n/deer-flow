/**
 * Onboarding types for DeerFlow Electron platform.
 */

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey?: string;
  enabled: boolean;
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  providers: ProviderConfig[];
  featuresViewed: boolean;
}

export interface OnboardingStatus {
  completed: boolean;
  currentStep: number;
}

export interface OnboardingUpdate {
  currentStep?: number;
  providers?: ProviderConfig[];
  featuresViewed?: boolean;
}

export interface ProviderApiKeys {
  keys: Record<string, string>;
}