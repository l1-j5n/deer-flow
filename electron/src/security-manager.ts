/**
 * DeerFlow Electron - Security Manager
 *
 * Centralized security controls for the agent platform:
 * - API key encryption at rest (AES-256-GCM)
 * - Sandboxed file access permissions
 * - Content Security Policy enforcement
 * - Request validation and sanitization
 * - Rate limiting for sensitive operations
 * - Secret rotation and cleanup
 * - Permission-based feature gating
 *
 * Integrates with ConfigManager for secure credential storage.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ============================================================
// Type Definitions
// ============================================================

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRule {
  id: string;
  type: "file_access" | "network" | "command" | "data_export" | "config_change";
  action: "allow" | "deny" | "prompt";
  pattern: string; // Regex or glob pattern
  severity: "critical" | "high" | "medium" | "low";
  metadata?: Record<string, any>;
}

export interface EncryptedSecret {
  id: string;
  name: string;
  encryptedValue: string;
  iv: string;
  authTag: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessed: string;
}

export interface PermissionSet {
  userId: string;
  permissions: string[];
  restrictions: string[];
  grantedAt: string;
  expiresAt?: string;
}

export interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: number;
  windowMs: number;
}

// ============================================================
// Security Manager
// ============================================================

const SECURITY_DIR = "security";
const SECRETS_FILE = "secrets.enc";
const POLICY_FILE = "policies.json";
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export class SecurityManager {
  private projectRoot: string;
  private securityDir: string;
  private secrets: Map<string, EncryptedSecret> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private masterKey: Buffer | null = null;
  private dirty = false;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.securityDir = path.join(projectRoot, ".deerflow", SECURITY_DIR);
    this.ensureDirectories();
    this.loadSecrets();
    this.loadPolicies();
    this.initializeMasterKey();
  }

  // ============================================================
  // Secret Management
  // ============================================================

  /**
   * Store a secret securely
   */
  storeSecret(name: string, value: string): EncryptedSecret {
    if (!this.masterKey) {
      throw new Error("Master key not initialized");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);

    let encrypted = cipher.update(value, "utf-8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    const secret: EncryptedSecret = {
      id: this.generateId(),
      name,
      encryptedValue: encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
    };

    this.secrets.set(secret.id, secret);
    this.dirty = true;
    this.saveSecrets();

    return secret;
  }

  /**
   * Retrieve a secret
   */
  retrieveSecret(id: string): { success: boolean; value?: string; error?: string } {
    try {
      if (!this.masterKey) {
        return { success: false, error: "Master key not initialized" };
      }

      const secret = this.secrets.get(id);
      if (!secret) {
        return { success: false, error: "Secret not found" };
      }

      const iv = Buffer.from(secret.iv, "hex");
      const authTag = Buffer.from(secret.authTag, "hex");
      const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(secret.encryptedValue, "hex", "utf-8");
      decrypted += decipher.final("utf-8");

      secret.accessCount++;
      secret.lastAccessed = new Date().toISOString();
      this.dirty = true;
      this.saveSecrets();

      return { success: true, value: decrypted };
    } catch (err: any) {
      return { success: false, error: `Decryption failed: ${err.message}` };
    }
  }

  /**
   * Retrieve secret by name
   */
  retrieveSecretByName(name: string): { success: boolean; value?: string; error?: string } {
    for (const secret of this.secrets.values()) {
      if (secret.name === name) {
        return this.retrieveSecret(secret.id);
      }
    }
    return { success: false, error: "Secret not found" };
  }

  /**
   * Delete a secret
   */
  deleteSecret(id: string): boolean {
    const secret = this.secrets.get(id);
    if (!secret) return false;

    this.secrets.delete(id);
    this.dirty = true;
    this.saveSecrets();
    return true;
  }

  /**
   * List all secrets (without values)
   */
  listSecrets(): Array<Omit<EncryptedSecret, "encryptedValue" | "iv" | "authTag">> {
    return Array.from(this.secrets.values()).map((s) => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      accessCount: s.accessCount,
      lastAccessed: s.lastAccessed,
    }));
  }

  // ============================================================
  // Policy Management
  // ============================================================

  /**
   * Create a security policy
   */
  createPolicy(name: string, description: string, rules: Omit<SecurityRule, "id">[]): SecurityPolicy {
    const policy: SecurityPolicy = {
      id: this.generateId(),
      name,
      description,
      rules: rules.map((r) => ({ ...r, id: this.generateId() })),
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(policy.id, policy);
    this.savePolicies();
    return policy;
  }

  /**
   * Get a policy
   */
  getPolicy(id: string): SecurityPolicy | null {
    return this.policies.get(id) || null;
  }

  /**
   * List all policies
   */
  listPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Update a policy
   */
  updatePolicy(id: string, updates: Partial<Omit<SecurityPolicy, "id" | "createdAt">>): boolean {
    const policy = this.policies.get(id);
    if (!policy) return false;

    Object.assign(policy, updates, { updatedAt: new Date().toISOString() });
    this.savePolicies();
    return true;
  }

  /**
   * Delete a policy
   */
  deletePolicy(id: string): boolean {
    return this.policies.delete(id);
  }

  /**
   * Check if an action is allowed
   */
  checkPermission(action: string, context: { type: string; path?: string; target?: string }): {
    allowed: boolean;
    action: "allow" | "deny" | "prompt";
    policy?: string;
    reason?: string;
  } {
    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;

      for (const rule of policy.rules) {
        if (rule.type !== context.type) continue;

        const regex = new RegExp(rule.pattern);
        const target = context.path || context.target || action;

        if (regex.test(target)) {
          return {
            allowed: rule.action === "allow",
            action: rule.action,
            policy: policy.name,
            reason: `Matched rule: ${rule.pattern}`,
          };
        }
      }
    }

    // Default allow if no policy matches
    return { allowed: true, action: "allow" };
  }

  // ============================================================
  // Rate Limiting
  // ============================================================

  /**
   * Check rate limit for an operation
   */
  checkRateLimit(key: string, maxRequests: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      // New window
      this.rateLimits.set(key, {
        key,
        count: 1,
        windowStart: now,
        windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.windowStart + windowMs,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.windowStart + windowMs,
    };
  }

  /**
   * Reset rate limit for a key
   */
  resetRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }

  // ============================================================
  // Sanitization
  // ============================================================

  /**
   * Sanitize a file path to prevent directory traversal
   */
  sanitizePath(inputPath: string, allowedBaseDirs: string[]): { safe: boolean; path?: string; error?: string } {
    const resolved = path.resolve(inputPath);

    for (const baseDir of allowedBaseDirs) {
      const resolvedBase = path.resolve(baseDir);
      if (resolved.startsWith(resolvedBase)) {
        return { safe: true, path: resolved };
      }
    }

    return { safe: false, error: "Path is outside allowed directories" };
  }

  /**
   * Sanitize user input to prevent injection
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim();
  }

  /**
   * Validate API key format
   */
  validateApiKey(key: string, provider: string): { valid: boolean; error?: string } {
    if (!key || key.length < 8) {
      return { valid: false, error: "API key too short" };
    }

    const patterns: Record<string, RegExp> = {
      openai: /^sk-[a-zA-Z0-9]{32,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9_-]{32,}$/,
      gemini: /^AIza[a-zA-Z0-9_-]{32,}$/,
    };

    const pattern = patterns[provider];
    if (pattern && !pattern.test(key)) {
      return { valid: false, error: `Invalid API key format for ${provider}` };
    }

    return { valid: true };
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.securityDir)) {
      fs.mkdirSync(this.securityDir, { recursive: true });
    }
  }

  private initializeMasterKey(): void {
    try {
      const keyPath = path.join(this.securityDir, ".master-key");
      if (fs.existsSync(keyPath)) {
        const hex = fs.readFileSync(keyPath, "utf-8").trim();
        this.masterKey = Buffer.from(hex, "hex");
      } else {
        this.masterKey = crypto.randomBytes(KEY_LENGTH);
        fs.writeFileSync(keyPath, this.masterKey.toString("hex"), { mode: 0o600 });
      }
    } catch (err) {
      console.error("[SecurityManager] Failed to initialize master key:", err);
      this.masterKey = crypto.randomBytes(KEY_LENGTH);
    }
  }

  private loadSecrets(): void {
    try {
      const secretsPath = path.join(this.securityDir, SECRETS_FILE);
      if (!fs.existsSync(secretsPath)) return;

      const data = JSON.parse(fs.readFileSync(secretsPath, "utf-8"));
      for (const secret of data.secrets || []) {
        this.secrets.set(secret.id, secret);
      }
    } catch (err) {
      console.warn("[SecurityManager] Failed to load secrets:", err);
    }
  }

  private saveSecrets(): void {
    if (!this.dirty) return;
    try {
      const secretsPath = path.join(this.securityDir, SECRETS_FILE);
      const data = {
        updatedAt: new Date().toISOString(),
        secrets: Array.from(this.secrets.values()),
      };
      fs.writeFileSync(secretsPath, JSON.stringify(data, null, 2), { mode: 0o600 });
      this.dirty = false;
    } catch (err) {
      console.warn("[SecurityManager] Failed to save secrets:", err);
    }
  }

  private loadPolicies(): void {
    try {
      const policyPath = path.join(this.securityDir, POLICY_FILE);
      if (!fs.existsSync(policyPath)) return;

      const data = JSON.parse(fs.readFileSync(policyPath, "utf-8"));
      for (const policy of data.policies || []) {
        this.policies.set(policy.id, policy);
      }
    } catch (err) {
      console.warn("[SecurityManager] Failed to load policies:", err);
    }
  }

  private savePolicies(): void {
    try {
      const policyPath = path.join(this.securityDir, POLICY_FILE);
      const data = {
        updatedAt: new Date().toISOString(),
        policies: Array.from(this.policies.values()),
      };
      fs.writeFileSync(policyPath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.warn("[SecurityManager] Failed to save policies:", err);
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    this.saveSecrets();
    this.savePolicies();
    this.rateLimits.clear();
  }

  private generateId(): string {
    return `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
