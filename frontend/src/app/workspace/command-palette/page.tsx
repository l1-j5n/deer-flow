"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  CommandIcon,
  CornerDownLeftIcon,
  FileTextIcon,
  HashIcon,
  HomeIcon,
  KeyboardIcon,
  LayoutDashboardIcon,
  MessagesSquareIcon,
  PlugIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  shortcut?: string;
}

const categories = [
  { id: "all", label: "All" },
  { id: "navigation", label: "Navigation" },
  { id: "action", label: "Actions" },
  { id: "tool", label: "Tools" },
  { id: "setting", label: "Settings" },
];

export default function CommandPalettePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateTo = useCallback((path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  }, []);

  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: "nav-dashboard",
      title: "Dashboard",
      description: "Go to system dashboard",
      icon: <LayoutDashboardIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace/dashboard"),
      shortcut: "G D",
    },
    {
      id: "nav-chats",
      title: "Chats",
      description: "Go to chat list",
      icon: <MessagesSquareIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace/chats"),
      shortcut: "G C",
    },
    {
      id: "nav-agents",
      title: "Agents",
      description: "Go to agent gallery",
      icon: <SparklesIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace/agents"),
      shortcut: "G A",
    },
    {
      id: "nav-health",
      title: "Health Monitor",
      description: "Go to health monitor",
      icon: <TrendingUpIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace/health"),
    },
    {
      id: "nav-collaboration",
      title: "Collaboration",
      description: "Go to agent collaboration",
      icon: <UsersIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace/collaboration"),
    },
    {
      id: "nav-knowledge-graph",
      title: "Knowledge Graph",
      description: "Go to knowledge graph",
      icon: <HashIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace/knowledge-graph"),
    },
    {
      id: "nav-home",
      title: "Home",
      description: "Go to workspace home",
      icon: <HomeIcon className="size-4" />,
      category: "navigation",
      action: () => navigateTo("/workspace"),
      shortcut: "G H",
    },
    // Actions
    {
      id: "action-new-chat",
      title: "New Chat",
      description: "Start a new conversation",
      icon: <MessagesSquareIcon className="size-4" />,
      category: "action",
      action: () => navigateTo("/workspace/chats"),
      shortcut: "Ctrl+N",
    },
    {
      id: "action-search",
      title: "Advanced Search",
      description: "Open global search",
      icon: <SearchIcon className="size-4" />,
      category: "action",
      action: () => navigateTo("/workspace/search"),
      shortcut: "Ctrl+Shift+F",
    },
    {
      id: "action-toggle-sidebar",
      title: "Toggle Sidebar",
      description: "Show or hide sidebar",
      icon: <LayoutDashboardIcon className="size-4" />,
      category: "action",
      action: () => {
        const btn = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
        btn?.click();
      },
      shortcut: "Ctrl+B",
    },
    // Tools
    {
      id: "tool-registry",
      title: "Tool Registry",
      description: "Browse and manage tools",
      icon: <WrenchIcon className="size-4" />,
      category: "tool",
      action: () => navigateTo("/workspace/tools"),
    },
    {
      id: "tool-plugins",
      title: "Plugins",
      description: "Manage plugins",
      icon: <PlugIcon className="size-4" />,
      category: "tool",
      action: () => navigateTo("/workspace/plugins"),
    },
    {
      id: "tool-memory",
      title: "Memory Browser",
      description: "Browse conversation memories",
      icon: <FileTextIcon className="size-4" />,
      category: "tool",
      action: () => navigateTo("/workspace/memory"),
    },
    {
      id: "tool-reasoning",
      title: "Reasoning Traces",
      description: "View reasoning traces",
      icon: <SparklesIcon className="size-4" />,
      category: "tool",
      action: () => navigateTo("/workspace/reasoning"),
    },
    // Settings
    {
      id: "set-shortcuts",
      title: "Keyboard Shortcuts",
      description: "Customize shortcuts",
      icon: <KeyboardIcon className="size-4" />,
      category: "setting",
      action: () => navigateTo("/workspace/shortcuts"),
    },
    {
      id: "set-theme",
      title: "Theme Settings",
      description: "Change appearance",
      icon: <SettingsIcon className="size-4" />,
      category: "setting",
      action: () => navigateTo("/workspace/theme"),
    },
    {
      id: "set-security",
      title: "Security",
      description: "Security settings",
      icon: <ShieldIcon className="size-4" />,
      category: "setting",
      action: () => navigateTo("/workspace/security"),
    },
  ];

  const filteredCommands = allCommands.filter((cmd) => {
    const matchesCategory = activeCategory === "all" || cmd.category === activeCategory;
    const matchesQuery =
      query.trim() === "" ||
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  useEffect(() => {
    const saved = localStorage.getItem("deerflow-recent-commands");
    if (saved) {
      try {
        setRecentCommands(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          executeCommand(cmd);
        }
      } else if (e.key === "Escape") {
        setQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex]);

  const executeCommand = (cmd: CommandItem) => {
    setRecentCommands((prev) => {
      const next = [cmd.id, ...prev.filter((id) => id !== cmd.id)].slice(0, 8);
      localStorage.setItem("deerflow-recent-commands", JSON.stringify(next));
      return next;
    });
    cmd.action();
  };

  const recentCmdItems = allCommands.filter((cmd) => recentCommands.includes(cmd.id));

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <CommandIcon className="size-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Command Palette</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute left-3 top-2.5 size-4" />
            <Input
              ref={inputRef}
              placeholder="Type a command or search..."
              className="pl-9 pr-20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute right-2 top-1.5 flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] h-5">
                <CornerDownLeftIcon className="size-3 mr-1" />
                Enter
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5">
                <XIcon className="size-3 mr-1" />
                Esc
              </Badge>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recent Commands */}
          {query.trim() === "" && recentCmdItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </h3>
              <div className="space-y-1">
                {recentCmdItems.slice(0, 5).map((cmd) => (
                  <button
                    key={`recent-${cmd.id}`}
                    onClick={() => executeCommand(cmd)}
                    className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground">{cmd.icon}</span>
                    <span className="flex-1">{cmd.title}</span>
                    <span className="text-muted-foreground text-xs">{cmd.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Command List */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <SearchIcon className="size-8 mb-2" />
                <p className="text-sm">No commands found</p>
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    index === selectedIndex
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className={index === selectedIndex ? "text-primary-foreground" : "text-muted-foreground"}>
                    {cmd.icon}
                  </span>
                  <span className="flex-1 font-medium">{cmd.title}</span>
                  <span
                    className={`text-xs ${
                      index === selectedIndex ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {cmd.description}
                  </span>
                  {cmd.shortcut && (
                    <Badge
                      variant={index === selectedIndex ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {cmd.shortcut}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↑↓</kbd> to navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Enter</kbd> to select
              </span>
            </div>
            <span>{filteredCommands.length} commands</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
