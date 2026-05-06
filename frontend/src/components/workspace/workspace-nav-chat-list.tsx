"use client";

import {
  ActivityIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  BotIcon,
  BrainCircuitIcon,
  CodeIcon,
  CommandIcon,
  LayersIcon,
  CpuIcon,
  DatabaseIcon,
  DownloadIcon,
  FlameIcon,
  GaugeIcon,
  KeyboardIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  MemoryStickIcon,
  MessagesSquare,
  NetworkIcon,
  PaletteIcon,
  PlugIcon,
  RadioIcon,
  RouteIcon,
  SaveIcon,
  SearchIcon,
  Settings2Icon,
  ShieldIcon,
  StoreIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useI18n } from "@/core/i18n/hooks";

export function WorkspaceNavChatList() {
  const { t } = useI18n();
  const pathname = usePathname();
  return (
    <SidebarGroup className="pt-1">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/workspace/chats"} asChild>
            <Link className="text-muted-foreground" href="/workspace/chats">
              <MessagesSquare />
              <span>{t("sidebar.chats")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/agents")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/agents">
              <BotIcon />
              <span>{t("sidebar.agents")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/dashboard")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/dashboard">
              <LayoutDashboardIcon />
              <span>{t("sidebar.dashboard")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/health")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/health">
              <ActivityIcon />
              <span>{t("sidebar.health")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/collaboration")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/collaboration">
              <UsersIcon />
              <span>{t("sidebar.collaboration")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/knowledge-graph")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/knowledge-graph">
              <NetworkIcon />
              <span>{t("sidebar.knowledgeGraph")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/knowledge-base")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/knowledge-base">
              <BookOpenIcon />
              <span>{t("sidebar.knowledgeBase")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/scheduler")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/scheduler">
              <BrainCircuitIcon />
              <span>{t("sidebar.scheduler")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/reasoning")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/reasoning">
              <RouteIcon />
              <span>{t("sidebar.reasoning")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/memory")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/memory">
              <MemoryStickIcon />
              <span>{t("sidebar.memory")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/tools")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/tools">
              <WrenchIcon />
              <span>{t("sidebar.tools")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/audit")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/audit">
              <ShieldIcon />
              <span>{t("sidebar.audit")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/plugins")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/plugins">
              <PlugIcon />
              <span>{t("sidebar.plugins")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/security")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/security">
              <CpuIcon />
              <span>{t("sidebar.security")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/performance")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/performance">
              <GaugeIcon />
              <span>{t("sidebar.performance")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/shortcuts")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/shortcuts">
              <KeyboardIcon />
              <span>{t("sidebar.shortcuts")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/theme")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/theme">
              <PaletteIcon />
              <span>{t("sidebar.theme")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/notifications")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/notifications">
              <BellIcon />
              <span>{t("sidebar.notifications")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/alerts")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/alerts">
              <AlertTriangleIcon />
              <span>{t("sidebar.alerts")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/data-manager")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/data-manager">
              <DatabaseIcon />
              <span>{t("sidebar.dataManager")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/search")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/search">
              <SearchIcon />
              <span>{t("sidebar.search")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/command-palette")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/command-palette">
              <CommandIcon />
              <span>{t("sidebar.commandPalette")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/templates")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/templates">
              <LayoutTemplateIcon />
              <span>{t("sidebar.templates")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/tool-tester")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/tool-tester">
              <Settings2Icon />
              <span>{t("sidebar.toolTester")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/plugin-monitor")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/plugin-monitor">
              <FlameIcon />
              <span>{t("sidebar.pluginMonitor")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/realtime-dashboard")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/realtime-dashboard">
              <RadioIcon />
              <span>{t("sidebar.realtimeDashboard")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/backup")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/backup">
              <SaveIcon />
              <span>{t("sidebar.backup")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/session-export")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/session-export">
              <DownloadIcon />
              <span>{t("sidebar.sessionExport")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/charts")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/charts">
              <BarChart3Icon />
              <span>{t("sidebar.charts")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/marketplace")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/marketplace">
              <StoreIcon />
              <span>{t("sidebar.marketplace")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/plugin-sdk")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/plugin-sdk">
              <CodeIcon />
              <span>{t("sidebar.pluginSdk")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/workspace/agent-context")}
            asChild
          >
            <Link className="text-muted-foreground" href="/workspace/agent-context">
              <LayersIcon />
              <span>{t("sidebar.agentContext")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
