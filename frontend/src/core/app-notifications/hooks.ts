import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  markNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
} from "./api";

const NOTIF_KEY = "app-notifications" as const;

/* ── Queries ─────────────────────────────────────────────────────── */

export interface UseNotificationsParams {
  category?: string;
  severity?: string;
  unread_only?: boolean;
}

export function useNotifications(params?: UseNotificationsParams) {
  return useQuery({
    queryKey: [NOTIF_KEY, "list", params],
    queryFn: () => listNotifications(params),
    staleTime: 15_000,
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: [NOTIF_KEY, "settings"],
    queryFn: getNotificationSettings,
    staleTime: 60_000,
  });
}

/* ── Mutations ───────────────────────────────────────────────────── */

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => markNotificationsRead({ ids }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NOTIF_KEY] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NOTIF_KEY] });
    },
  });
}

export function useClearAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearAllNotifications(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NOTIF_KEY] });
    },
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [NOTIF_KEY] });
    },
  });
}
