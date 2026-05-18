"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE = "";

interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  api_keys: Array<{ key_id: string; name: string; permissions: string[]; created_at: string }>;
  created_at: string;
  last_login: string | null;
  status: string;
}

interface Role {
  role_id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

interface AuditLog {
  log_id: string;
  action: string;
  user_id: string;
  target: string;
  details: Record<string, unknown>;
  timestamp: string;
}

interface Webhook {
  webhook_id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
}

interface Integration {
  integration_id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

export default function VersionPermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  // Load data
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/users`);
      setUsers(await res.json());
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/roles`);
      setRoles(await res.json());
    } catch (e) {
      console.error("Failed to load roles:", e);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/audit/logs/query?limit=50`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setAuditLogs(await res.json());
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    }
  }, []);

  const loadWebhooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/integrations/webhooks`);
      setWebhooks(await res.json());
    } catch (e) {
      console.error("Failed to load webhooks:", e);
    }
  }, []);

  const loadIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/integrations`);
      setIntegrations(await res.json());
    } catch (e) {
      console.error("Failed to load integrations:", e);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadAuditLogs();
    loadWebhooks();
    loadIntegrations();
  }, [loadUsers, loadRoles, loadAuditLogs, loadWebhooks, loadIntegrations]);

  // Create user
  const createUser = async () => {
    if (!newUsername.trim() || !newEmail.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, email: newEmail, role: newRole }),
      });
      setNewUsername("");
      setNewEmail("");
      setNewRole("viewer");
      loadUsers();
    } catch (e) {
      console.error("Failed to create user:", e);
    }
    setLoading(false);
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      await fetch(`${API_BASE}/api/kg/users/${userId}`, { method: "DELETE" });
      loadUsers();
    } catch (e) {
      console.error("Failed to delete user:", e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "disabled":
        return <Badge variant="secondary">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string, isSystem: boolean) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500",
      editor: "bg-blue-500",
      viewer: "bg-gray-500",
    };
    return (
      <Badge className={colors[role] || "bg-purple-500"}>
        {isSystem ? "🏛️" : "📋"} {role}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes("create")) return "➕";
    if (action.includes("update")) return "✏️";
    if (action.includes("delete")) return "🗑️";
    if (action.includes("login")) return "🔑";
    return "📝";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Permissions & Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and audit logs for security and compliance
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v1.43
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create User</CardTitle>
                <CardDescription>Add a new user to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createUser} disabled={loading} className="w-full">
                  Create User
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No users created yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.username}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role, false)}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell className="text-sm">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => deleteUser(user.user_id)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.role_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {role.is_system ? "🏛️" : "📋"} {role.name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((perm) => (
                        <Badge key={perm} variant="outline">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                    {role.is_system && (
                      <p className="text-xs text-muted-foreground">System role (cannot be deleted)</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Audit log of system actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {auditLogs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No audit logs recorded yet
                      </p>
                    ) : (
                      auditLogs.map((log) => (
                        <div
                          key={log.log_id}
                          className="flex items-center gap-3 p-2 border rounded-lg hover:bg-accent/50"
                        >
                          <span className="text-xl">{getActionIcon(log.action)}</span>
                          <div className="flex-1">
                            <div className="font-medium">{log.action}</div>
                            <div className="text-sm text-muted-foreground">
                              User: {log.user_id} • Target: {log.target}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{auditLogs.length}</div>
                    <div className="text-sm text-muted-foreground">Total Logs</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {new Set(auditLogs.map((l) => l.user_id)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Configure webhook notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {webhooks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No webhooks configured</p>
                    ) : (
                      webhooks.map((wh) => (
                        <div key={wh.webhook_id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{wh.name}</div>
                            <div className="text-sm text-muted-foreground">{wh.url}</div>
                          </div>
                          <Badge variant={wh.enabled ? "default" : "secondary"}>
                            {wh.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Integrations</CardTitle>
                <CardDescription>Third-party service connections</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {integrations.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No integrations configured</p>
                    ) : (
                      integrations.map((int) => (
                        <div key={int.integration_id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{int.name}</div>
                            <div className="text-sm text-muted-foreground">{int.type}</div>
                          </div>
                          <Badge variant={int.enabled ? "default" : "secondary"}>
                            {int.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}