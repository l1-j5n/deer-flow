/** Security Settings type definitions. */

export type PolicyType = "allow" | "deny" | "prompt";
export type PolicyCategory = "path" | "file" | "input" | "network" | "command";

export interface SecurityPolicy {
  id: string;
  name: string;
  type: PolicyType;
  pattern: string;
  enabled: boolean;
  category: PolicyCategory;
}

export interface RateLimitStatus {
  windowMs: number;
  maxRequests: number;
  currentRequests: number;
  remainingRequests: number;
  resetAt: string;
}

export interface SecurityStats {
  encryptionEnabled: boolean;
  totalPolicies: number;
  activePolicies: number;
  rateLimitEnabled: boolean;
  inputSanitizationEnabled: boolean;
  pathSanitizationEnabled: boolean;
  apiKeyValidationEnabled: boolean;
}

export interface PolicyListResponse {
  policies: SecurityPolicy[];
  total: number;
}
