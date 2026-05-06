/** Backup type definitions. */

export interface BackupEntry {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  description?: string;
  tags: string[];
  contents: Array<{ type: string; count: number; size: number }>;
  compressed: boolean;
}

export interface BackupConfig {
  enabled: boolean;
  intervalHours: number;
  maxBackups: number;
  backupPath: string;
  includeSessions: boolean;
  includeWorkflows: boolean;
  includeKnowledgeGraph: boolean;
  includeConfig: boolean;
  includeMemories: boolean;
  includePlugins: boolean;
  compress: boolean;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup?: string;
  newestBackup?: string;
  autoBackupEnabled: boolean;
  nextScheduledBackup?: string;
}

export interface CreateBackupRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface BackupRestoreRequest {
  backupId: string;
  mergeStrategy: "overwrite" | "merge" | "skip";
  components: string[];
}

export interface BackupRestoreResponse {
  success: boolean;
  restoredItems: string[];
  errors: string[];
}

export interface AutoBackupStatus {
  enabled: boolean;
  running: boolean;
  intervalHours: number;
  nextScheduled: string | null;
  schedulerTaskId: string | null;
}
