"use client";

import { useState } from "react";
import {
  BrainCircuitIcon,
  CalendarIcon,
  ClockIcon,
  Edit3Icon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  useTasks,
  useSchedulerStats,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useEnableTask,
  useDisableTask,
  useRunTaskNow,
} from "@/core/scheduler";
import type {
  ScheduledTask,
  TaskType,
  TaskSchedule,
  TaskAction,
  TaskConfig,
} from "@/core/scheduler";

type ScheduleType = "once" | "interval" | "cron";

const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  once: "One-time",
  interval: "Interval",
  cron: "Cron",
};

const TYPE_LABELS: Record<TaskType, string> = {
  workflow: "Workflow",
  session: "Session",
  skill: "Skill",
  system: "System",
  backup: "Backup",
  cleanup: "Cleanup",
};

function TaskStatusBadge({ enabled, nextRunAt }: { enabled: boolean; nextRunAt?: string }) {
  if (!enabled) return <Badge variant="secondary">Disabled</Badge>;
  if (!nextRunAt) return <Badge variant="outline">Pending</Badge>;
  const next = new Date(nextRunAt);
  if (next <= new Date()) return <Badge variant="default">Ready</Badge>;
  return <Badge variant="default">Scheduled</Badge>;
}

// ============================================================
// Task Form Dialog (Create / Edit)
// ============================================================

interface TaskFormData {
  name: string;
  description: string;
  type: TaskType;
  scheduleType: ScheduleType;
  enabled: boolean;
  intervalSeconds: string;
  cronExpression: string;
  atTime: string;
}

function initFromTask(task?: ScheduledTask): TaskFormData {
  if (!task) {
    return {
      name: "",
      description: "",
      type: "system" as TaskType,
      scheduleType: "once",
      enabled: true,
      intervalSeconds: "",
      cronExpression: "",
      atTime: "",
    };
  }
  return {
    name: task.name ?? "",
    description: task.description ?? "",
    type: task.type ?? "system",
    scheduleType: (task.schedule?.type as ScheduleType) ?? "once",
    enabled: task.config?.enabled ?? true,
    intervalSeconds: task.schedule?.intervalMs
      ? String(Math.floor(task.schedule.intervalMs / 1000))
      : "",
    cronExpression: task.schedule?.cron ?? "",
    atTime: task.schedule?.at ?? "",
  };
}

function TaskFormDialog({
  task,
  onSaved,
  trigger,
}: {
  task?: ScheduledTask;
  onSaved: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskFormData>(initFromTask(task));
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const isEdit = !!task;
  const saving = createMutation.isPending || updateMutation.isPending;

  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initFromTask(task));
    setOpen(v);
  };

  const updateForm = (field: keyof TaskFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildSchedule = (): TaskSchedule => {
    const sched: TaskSchedule = { type: form.scheduleType };
    if (form.scheduleType === "interval" && form.intervalSeconds) {
      sched.intervalMs = parseInt(form.intervalSeconds, 10) * 1000;
    }
    if (form.scheduleType === "cron" && form.cronExpression) {
      sched.cron = form.cronExpression;
    }
    if (form.scheduleType === "once" && form.atTime) {
      sched.at = form.atTime;
    }
    return sched;
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    const schedule = buildSchedule();
    const action: TaskAction = {
      handler: form.type === "backup" ? "system:backup" : "system:dummy",
      params: {},
    };
    const config: TaskConfig = {
      enabled: form.enabled,
      maxRetries: task?.config?.maxRetries ?? 3,
      retryDelayMs: task?.config?.retryDelayMs ?? 5000,
      timeoutMs: task?.config?.timeoutMs ?? 300000,
      skipIfRunning: task?.config?.skipIfRunning ?? true,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({
        id: task.id,
        updates: {
          name: form.name,
          description: form.description,
          type: form.type,
          schedule,
          action,
          config,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: form.name,
        description: form.description,
        type: form.type,
        schedule,
        action,
        config,
      } as ScheduledTask & { name: string });
    }
    setOpen(false);
    onSaved();
  };

  const isValid = form.name.trim();
  const submitLabel = saving ? "Saving..." : isEdit ? "Save Changes" : "Create Task";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create Scheduled Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the scheduled task configuration."
              : "Set up a new automated task with a schedule."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              placeholder="e.g., Daily Report Generation"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="What does this task do?"
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => updateForm("type", v as TaskType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <Select
                value={form.scheduleType}
                onValueChange={(v) => updateForm("scheduleType", v as ScheduleType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCHEDULE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.scheduleType === "once" && (
            <div className="space-y-2">
              <Label htmlFor="at-time">Run At (ISO datetime)</Label>
              <Input
                id="at-time"
                type="datetime-local"
                value={form.atTime}
                onChange={(e) => updateForm("atTime", e.target.value)}
              />
            </div>
          )}

          {form.scheduleType === "interval" && (
            <div className="space-y-2">
              <Label htmlFor="interval">Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                placeholder="3600"
                value={form.intervalSeconds}
                onChange={(e) => updateForm("intervalSeconds", e.target.value)}
              />
            </div>
          )}

          {form.scheduleType === "cron" && (
            <div className="space-y-2">
              <Label htmlFor="cron">Cron Expression</Label>
              <Input
                id="cron"
                placeholder="0 9 * * *"
                value={form.cronExpression}
                onChange={(e) => updateForm("cronExpression", e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Format: minute hour day month weekday
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch
              id="enabled"
              checked={form.enabled}
              onCheckedChange={(v) => updateForm("enabled", v)}
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enabled
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || saving}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function SchedulerPage() {
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useTasks();
  const { data: stats } = useSchedulerStats();

  const enableMutation = useEnableTask();
  const disableMutation = useDisableTask();
  const runMutation = useRunTaskNow();
  const deleteMutation = useDeleteTask();

  const loading = tasksLoading;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuitIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Task Scheduler</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
          <TaskFormDialog
            onSaved={() => refetch()}
            trigger={
              <Button size="sm">
                <PlusIcon className="size-4 mr-2" />
                New Task
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-muted-foreground text-xs">{stats.enabledTasks} enabled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions}</div>
              <p className="text-muted-foreground text-xs">{stats.executionsToday} today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalExecutions > 0
                  ? ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-muted-foreground text-xs">{stats.successfulExecutions} passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.failedExecutions}</div>
              <p className="text-muted-foreground text-xs">Total failures</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>Manage automated tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BrainCircuitIcon className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground">No scheduled tasks yet.</p>
              <div className="mt-4">
                <TaskFormDialog
                  onSaved={() => refetch()}
                  trigger={
                    <Button variant="outline">
                      <PlusIcon className="size-4 mr-2" />
                      Create First Task
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <TaskStatusBadge
                      enabled={task.config?.enabled ?? false}
                      nextRunAt={task.nextRunAt}
                    />
                    <div>
                      <div className="font-medium">{task.name}</div>
                      {task.description && (
                        <p className="text-muted-foreground text-sm">{task.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 capitalize">
                          <CalendarIcon className="size-3" />
                          {TYPE_LABELS[task.type as TaskType] ?? task.type}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <ClockIcon className="size-3" />
                          {SCHEDULE_TYPE_LABELS[task.schedule?.type as ScheduleType] ??
                            task.schedule?.type}
                        </span>
                        {task.nextRunAt && (
                          <span>Next: {new Date(task.nextRunAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        task.config?.enabled
                          ? disableMutation.mutate(task.id)
                          : enableMutation.mutate(task.id)
                      }
                      title={task.config?.enabled ? "Disable" : "Enable"}
                      disabled={enableMutation.isPending || disableMutation.isPending}
                    >
                      {task.config?.enabled ? (
                        <PauseIcon className="size-4" />
                      ) : (
                        <PlayIcon className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => runMutation.mutate(task.id)}
                      title="Run now"
                      disabled={runMutation.isPending}
                    >
                      <RefreshCwIcon className="size-4" />
                    </Button>
                    <TaskFormDialog
                      task={task}
                      onSaved={() => refetch()}
                      trigger={
                        <Button variant="ghost" size="icon" className="size-8" title="Edit">
                          <Edit3Icon className="size-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => deleteMutation.mutate(task.id)}
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
