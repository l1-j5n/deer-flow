import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getTemplates,
  listExports,
  exportSession,
  deleteExport,
  getExportStats,
  type ExportTemplate,
  type ExportRecord,
  type ExportOptions,
  type ExportStats,
} from "./api";

/**
 * Query hook for export templates.
 */
export function useExportTemplates() {
  return useQuery<ExportTemplate[]>({
    queryKey: ["session-export", "templates"],
    queryFn: getTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query hook for export history.
 */
export function useExportHistory() {
  return useQuery<ExportRecord[]>({
    queryKey: ["session-export", "exports"],
    queryFn: listExports,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Query hook for export statistics.
 */
export function useExportStats() {
  return useQuery<ExportStats | null>({
    queryKey: ["session-export", "stats"],
    queryFn: getExportStats,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Mutation hook for exporting a session.
 */
export function useExportSession() {
  return useMutation({
    mutationFn: ({
      sessionId,
      options,
    }: {
      sessionId: string;
      options?: ExportOptions;
    }) => exportSession(sessionId, options),
  });
}

/**
 * Mutation hook for deleting an export.
 */
export function useDeleteExport() {
  return useMutation({
    mutationFn: (fileName: string) => deleteExport(fileName),
  });
}