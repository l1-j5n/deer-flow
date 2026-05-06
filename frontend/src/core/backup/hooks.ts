import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBackupConfig,
  updateBackupConfig,
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup,
  getBackupStats,
  getAutoBackupStatus,
  startAutoBackup,
  stopAutoBackup,
} from "./api";
import type { BackupConfig, BackupRestoreRequest, CreateBackupRequest } from "./types";

const BACKUP_KEY = "backup" as const;

export function useBackupConfig() {
  return useQuery({
    queryKey: [BACKUP_KEY, "config"],
    queryFn: getBackupConfig,
    staleTime: 60_000,
  });
}

export function useUpdateBackupConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<BackupConfig>) => updateBackupConfig(config),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [BACKUP_KEY] });
    },
  });
}

export function useBackups() {
  return useQuery({
    queryKey: [BACKUP_KEY, "list"],
    queryFn: listBackups,
    staleTime: 15_000,
  });
}

export function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req?: CreateBackupRequest) => createBackup(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [BACKUP_KEY] });
    },
  });
}

export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBackup(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [BACKUP_KEY] });
    },
  });
}

export function useRestoreBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BackupRestoreRequest) => restoreBackup(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [BACKUP_KEY] });
    },
  });
}

export function useBackupStats() {
  return useQuery({
    queryKey: [BACKUP_KEY, "stats"],
    queryFn: getBackupStats,
    staleTime: 15_000,
  });
}

export function useAutoBackupStatus() {
  return useQuery({
    queryKey: [BACKUP_KEY, "auto-status"],
    queryFn: getAutoBackupStatus,
    staleTime: 15_000,
  });
}

export function useToggleAutoBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (enabled) {
        return startAutoBackup();
      }
      return stopAutoBackup();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [BACKUP_KEY] });
    },
  });
}
