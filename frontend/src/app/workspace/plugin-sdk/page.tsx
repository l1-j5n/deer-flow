"use client";

import { useState, useEffect, useCallback } from "react";
import { useValidateManifest, useGenerateScaffold } from "@/core/plugin-sdk";
import type { ValidationResult, PluginManifest } from "@/core/plugin-sdk";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CodeIcon,
  FileJsonIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  Wand2Icon,
  DownloadIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
  BracesIcon,
  PuzzleIcon,
  ShieldIcon,
  ZapIcon,
} from "lucide-react";

// ============================================================
// Types (imported from @/core/plugin-sdk)
// ============================================================

// ManifestField is still defined locally as it's specific to the editor UI
interface ManifestField {
  id: string;
  label: string;
  type: "string" | "array" | "object" | "boolean";
  required: boolean;
  description: string;
  placeholder?: string;
}

// ============================================================
// Constants
// ============================================================

const MANIFEST_FIELDS: ManifestField[] = [
  { id: "id", label: "Plugin ID", type: "string", required: true, description: "Unique identifier (e.g., com.example.my-plugin)", placeholder: "com.example.my-plugin" },
  { id: "name", label: "Name", type: "string", required: true, description: "Human-readable plugin name", placeholder: "My Plugin" },
  { id: "version", label: "Version", type: "string", required: true, description: "Semantic version (e.g., 1.0.0)", placeholder: "1.0.0" },
  { id: "description", label: "Description", type: "string", required: true, description: "Short description of what the plugin does", placeholder: "Does something amazing..." },
  { id: "author", label: "Author", type: "string", required: true, description: "Author name or organization", placeholder: "Your Name" },
  { id: "license", label: "License", type: "string", required: false, description: "License identifier (e.g., MIT, Apache-2.0)", placeholder: "MIT" },
  { id: "entry", label: "Entry Point", type: "string", required: true, description: "Main file path relative to plugin root", placeholder: "index.js" },
  { id: "minPlatformVersion", label: "Min Platform Version", type: "string", required: false, description: "Minimum DeerFlow version required", placeholder: "2.0.0" },
];

const AVAILABLE_PERMISSIONS = [
  { id: "filesystem.read", label: "Read Files", description: "Access to read files from the workspace" },
  { id: "filesystem.write", label: "Write Files", description: "Access to write files to the workspace" },
  { id: "network.http", label: "HTTP Requests", description: "Make HTTP/HTTPS requests" },
  { id: "network.websocket", label: "WebSocket", description: "Open WebSocket connections" },
  { id: "shell.execute", label: "Shell Execution", description: "Execute shell commands" },
  { id: "session.read", label: "Read Sessions", description: "Access to read session data" },
  { id: "session.write", label: "Write Sessions", description: "Modify session data" },
  { id: "memory.access", label: "Memory Access", description: "Access conversation memory" },
  { id: "kg.access", label: "Knowledge Graph", description: "Access knowledge graph data" },
  { id: "config.read", label: "Read Config", description: "Read application configuration" },
];

const AVAILABLE_HOOKS = [
  { id: "before-message", label: "Before Message", description: "Triggered before a message is processed" },
  { id: "after-message", label: "After Message", description: "Triggered after a message response" },
  { id: "on-tool-call", label: "On Tool Call", description: "Triggered when a tool is called" },
  { id: "on-session-start", label: "Session Start", description: "Triggered when a session starts" },
  { id: "on-session-end", label: "Session End", description: "Triggered when a session ends" },
  { id: "on-export", label: "On Export", description: "Triggered during data export" },
  { id: "on-theme-change", label: "Theme Change", description: "Triggered when theme changes" },
];

const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// DeerFlow Plugin Template
// Entry point: index.js

class MyPlugin {
  constructor(context) {
    this.context = context;
    this.pluginName = context.manifest.name;
  }

  async activate() {
    console.log(this.pluginName + " activated");

    // Register hooks
    this.context.hooks.on('before-message', this.onBeforeMessage.bind(this));
    this.context.hooks.on('after-message', this.onAfterMessage.bind(this));
  }

  async deactivate() {
    console.log(this.pluginName + " deactivated");
  }

  async onBeforeMessage(message) {
    // Process before message
    return message;
  }

  async onAfterMessage(message, response) {
    // Process after message
    return response;
  }
}

module.exports = MyPlugin;`,
  typescript: `// DeerFlow Plugin Template (TypeScript)
// Entry point: index.ts

import { PluginContext, Message, HookHandler } from '@deerflow/sdk';

export default class MyPlugin {
  private context: PluginContext;
  private pluginName: string;

  constructor(context: PluginContext) {
    this.context = context;
    this.pluginName = context.manifest.name;
  }

  async activate(): Promise<void> {
    console.log(this.pluginName + " activated");

    this.context.hooks.on('before-message', this.onBeforeMessage);
    this.context.hooks.on('after-message', this.onAfterMessage);
  }

  async deactivate(): Promise<void> {
    console.log(this.pluginName + " deactivated");
  }

  private onBeforeMessage: HookHandler = async (message: Message) => {
    return message;
  };

  private onAfterMessage: HookHandler = async (message: Message, response: Message) => {
    return response;
  };
}`,
  python: `# DeerFlow Plugin Template (Python)
# Entry point: __init__.py

class MyPlugin:
    def __init__(self, context):
        self.context = context
        self.name = context.manifest['name']

    def activate(self):
        print(f"{self.name} activated")

        self.context.hooks.on('before-message', self.on_before_message)
        self.context.hooks.on('after-message', self.on_after_message)

    def deactivate(self):
        print(f"{self.name} deactivated")

    def on_before_message(self, message):
        return message

    def on_after_message(self, message, response):
        return response`,
};

// ============================================================
// Validation Logic
// ============================================================

function validateManifest(manifest: Partial<PluginManifest>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.id) {
    errors.push("Plugin ID is required");
  } else if (!/^[a-z0-9.-]+$/.test(manifest.id)) {
    errors.push("Plugin ID must contain only lowercase letters, numbers, dots, and hyphens");
  }

  if (!manifest.name) {
    errors.push("Name is required");
  }

  if (!manifest.version) {
    errors.push("Version is required");
  } else if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
    warnings.push("Version should follow semantic versioning (e.g., 1.0.0)");
  }

  if (!manifest.description) {
    errors.push("Description is required");
  }

  if (!manifest.author) {
    errors.push("Author is required");
  }

  if (!manifest.entry) {
    errors.push("Entry point is required");
  }

  if (!manifest.permissions || manifest.permissions.length === 0) {
    warnings.push("No permissions declared. Plugin may have limited functionality.");
  }

  if (manifest.hooks && manifest.hooks.length === 0) {
    warnings.push("No hooks registered. Plugin won't receive any events.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// Main Page
// ============================================================

export default function PluginSDKPage() {
  const [manifest, setManifest] = useState<Partial<PluginManifest>>({
    id: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    license: "MIT",
    permissions: [],
    hooks: [],
    dependencies: {},
    entry: "index.js",
    minPlatformVersion: "2.0.0",
  });

  const [validation, setValidation] = useState<ValidationResult>({
    valid: false,
    errors: [],
    warnings: [],
  });

  const [activeTab, setActiveTab] = useState("editor");
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python">("javascript");
  const [copied, setCopied] = useState(false);

  // ── Electron SDK states ──────────────────────────────────────────
  const [sdkValidation, setSdkValidation] = useState<ValidationResult | null>(null);
  const [scaffoldResult, setScaffoldResult] = useState<string | null>(null);

  useEffect(() => {
    setValidation(validateManifest(manifest));
  }, [manifest]);

  // ── React Query: validate manifest via REST API ────────────────────────────
  const validateMutation = useValidateManifest();

  const handleSdkValidate = useCallback(async () => {
    validateMutation.mutate(manifest, {
      onSuccess: (data) => {
        setSdkValidation(data);
      },
      onError: (error: any) => {
        setSdkValidation({
          valid: false,
          errors: [error.message || "SDK validation failed"],
          warnings: [],
        });
      },
    });
  }, [manifest, validateMutation]);

  // ── React Query: generate plugin scaffold via REST API ────────────────
  const scaffoldMutation = useGenerateScaffold();

  const handleGenerateScaffold = useCallback(async () => {
    scaffoldMutation.mutate(
      { manifest, options: { language, includeTests: true, includeDocs: true } },
      {
        onSuccess: (data) => {
          setScaffoldResult(JSON.stringify(data.files, null, 2));
        },
        onError: (error: any) => {
          setScaffoldResult(`Scaffold generation failed: ${error.message || "unknown error"}`);
        },
      }
    );
  }, [manifest, language, scaffoldMutation]);

  const updateField = (field: string, value: any) => {
    setManifest((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permId: string) => {
    setManifest((prev) => {
      const perms = prev.permissions || [];
      if (perms.includes(permId)) {
        return { ...prev, permissions: perms.filter((p) => p !== permId) };
      }
      return { ...prev, permissions: [...perms, permId] };
    });
  };

  const toggleHook = (hookId: string) => {
    setManifest((prev) => {
      const hooks = prev.hooks || [];
      if (hooks.includes(hookId)) {
        return { ...prev, hooks: hooks.filter((h) => h !== hookId) };
      }
      return { ...prev, hooks: [...hooks, hookId] };
    });
  };

  const addDependency = () => {
    setManifest((prev) => ({
      ...prev,
      dependencies: { ...prev.dependencies, "": "" },
    }));
  };

  const updateDependency = (oldKey: string, newKey: string, value: string) => {
    setManifest((prev) => {
      const deps = { ...prev.dependencies };
      if (oldKey !== newKey) {
        delete deps[oldKey];
      }
      deps[newKey] = value;
      return { ...prev, dependencies: deps };
    });
  };

  const removeDependency = (key: string) => {
    setManifest((prev) => {
      const deps = { ...prev.dependencies };
      delete deps[key];
      return { ...prev, dependencies: deps };
    });
  };

  const generateManifestJSON = (): string => {
    return JSON.stringify(manifest, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateManifestJSON());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadManifest = () => {
    const blob = new Blob([generateManifestJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manifest.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CodeIcon className="h-6 w-6" />
            Plugin SDK
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, validate, and scaffold DeerFlow plugins with the manifest editor
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <CopyIcon className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy JSON"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadManifest}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="flex items-center gap-1">
            <FileJsonIcon className="h-4 w-4" />
            Manifest Editor
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-1">
            <ShieldIcon className="h-4 w-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="scaffold" className="flex items-center gap-1">
            <BracesIcon className="h-4 w-4" />
            Code Scaffold
          </TabsTrigger>
        </TabsList>

        {/* Manifest Editor */}
        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Form */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PuzzleIcon className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MANIFEST_FIELDS.map((field) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id} className="flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={field.id}
                        value={(manifest as any)[field.id] || ""}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldIcon className="h-4 w-4" />
                    Permissions
                  </CardTitle>
                  <CardDescription>Select the permissions your plugin requires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Switch
                          checked={manifest.permissions?.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{perm.label}</div>
                          <div className="text-xs text-muted-foreground">{perm.description}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {perm.id}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ZapIcon className="h-4 w-4" />
                    Hooks
                  </CardTitle>
                  <CardDescription>Select the event hooks your plugin listens to</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_HOOKS.map((hook) => (
                      <div
                        key={hook.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Switch
                          checked={manifest.hooks?.includes(hook.id)}
                          onCheckedChange={() => toggleHook(hook.id)}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{hook.label}</div>
                          <div className="text-xs text-muted-foreground">{hook.description}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {hook.id}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Dependencies</CardTitle>
                  <Button size="sm" variant="outline" onClick={addDependency}>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(manifest.dependencies || {}).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="package-name"
                        value={key}
                        onChange={(e) => updateDependency(key, e.target.value, value as string)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="^1.0.0"
                        value={value as string}
                        onChange={(e) => updateDependency(key, key, e.target.value)}
                        className="w-32"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeDependency(key)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {Object.keys(manifest.dependencies || {}).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No dependencies declared
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileJsonIcon className="h-4 w-4" />
                    manifest.json Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-[calc(100vh-250px)]">
                    <code>{generateManifestJSON()}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Validation */}
        <TabsContent value="validation">
          <div className="max-w-2xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validation.valid ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      Manifest Valid
                    </>
                  ) : (
                    <>
                      <AlertCircleIcon className="h-5 w-5 text-red-500" />
                      Validation Failed
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {validation.valid
                    ? "Your manifest is valid and ready for packaging."
                    : `Found ${validation.errors.length} error(s) and ${validation.warnings.length} warning(s).`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {validation.errors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-red-600 flex items-center gap-1">
                      <AlertCircleIcon className="h-4 w-4" />
                      Errors ({validation.errors.length})
                    </h3>
                    <div className="space-y-1">
                      {validation.errors.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm"
                        >
                          <AlertCircleIcon className="h-4 w-4 shrink-0" />
                          {err}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-amber-600 flex items-center gap-1">
                      <AlertCircleIcon className="h-4 w-4" />
                      Warnings ({validation.warnings.length})
                    </h3>
                    <div className="space-y-1">
                      {validation.warnings.map((warn, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm"
                        >
                          <AlertCircleIcon className="h-4 w-4 shrink-0" />
                          {warn}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validation.valid && validation.warnings.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-700 dark:text-green-300">
                      All checks passed!
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your plugin manifest is valid and ready for distribution.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* --- Electron SDK Validation --- */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ZapIcon className="h-4 w-4" />
                    Electron SDK Validation
                  </CardTitle>
                  <CardDescription>
                    Deep validation via the plugin-sdk-validator engine (requires Electron runtime)
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={handleSdkValidate}
                  disabled={validateMutation.isPending}
                >
                  <ZapIcon className="h-4 w-4 mr-2" />
                  {validateMutation.isPending ? "Validating..." : "Validate with SDK"}
                </Button>
              </CardHeader>
              <CardContent>
                {sdkValidation === null ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Click "Validate with SDK" to run deep manifest validation against the plugin SDK engine.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {sdkValidation.valid ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          SDK Valid
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          <AlertCircleIcon className="h-3 w-3 mr-1" />
                          SDK Invalid
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {sdkValidation.errors.length} error(s), {sdkValidation.warnings.length} warning(s)
                      </span>
                    </div>

                    {sdkValidation.errors.length > 0 && (
                      <div className="space-y-1">
                        {sdkValidation.errors.map((err, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
                            <AlertCircleIcon className="h-4 w-4 shrink-0" />
                            {err}
                          </div>
                        ))}
                      </div>
                    )}

                    {sdkValidation.warnings.length > 0 && (
                      <div className="space-y-1">
                        {sdkValidation.warnings.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm">
                            <AlertCircleIcon className="h-4 w-4 shrink-0" />
                            {w}
                          </div>
                        ))}
                      </div>
                    )}

                    {sdkValidation.valid && sdkValidation.warnings.length === 0 && (
                      <div className="text-center py-4">
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          SDK validation passed!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Code Scaffold */}
        <TabsContent value="scaffold">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(CODE_TEMPLATES[language] ?? "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateScaffold}
                  disabled={scaffoldMutation.isPending}
                >
                  <Wand2Icon className="h-4 w-4 mr-2" />
                  {scaffoldMutation.isPending ? "Generating..." : "Generate via SDK"}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wand2Icon className="h-4 w-4" />
                  Plugin Template ({language})
                </CardTitle>
                <CardDescription>
                  Starter code for your {language} plugin. Save as {manifest.entry || "index.js"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-[600px]">
                  <code>{CODE_TEMPLATES[language]}</code>
                </pre>
              </CardContent>
            </Card>

            {/* SDK-generated scaffold result */}
            {scaffoldResult !== null && (
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wand2Icon className="h-4 w-4 text-blue-400" />
                    SDK Scaffold Output
                  </CardTitle>
                  <CardDescription>
                    Full project scaffold generated by the plugin-sdk-validator engine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-[400px] whitespace-pre-wrap">
                    <code>{scaffoldResult}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            <Accordion type="single" collapsible>
              <AccordionItem value="structure">
                <AccordionTrigger>Plugin Directory Structure</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted rounded-lg p-4 text-xs">
                    {`my-plugin/
├── manifest.json          # Plugin manifest
├── ${manifest.entry || "index.js"}              # Entry point
├── README.md              # Documentation
├── icon.png               # Plugin icon (optional)
├── src/                   # Source code
│   ├── handlers/
│   │   └── message.js
│   └── utils/
│       └── helpers.js
└── tests/                 # Unit tests
    └── index.test.js`}
                  </pre>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="api">
                <AccordionTrigger>Plugin API Reference</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>context.manifest</strong> — Access to plugin manifest data</p>
                    <p><strong>context.hooks.on(event, handler)</strong> — Register event listener</p>
                    <p><strong>context.hooks.off(event, handler)</strong> — Remove event listener</p>
                    <p><strong>context.storage.get(key)</strong> — Get persistent storage value</p>
                    <p><strong>context.storage.set(key, value)</strong> — Set persistent storage value</p>
                    <p><strong>context.logger.info(msg)</strong> — Log info message</p>
                    <p><strong>context.logger.error(msg)</strong> — Log error message</p>
                    <p><strong>context.api.call(method, params)</strong> — Call DeerFlow API</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
