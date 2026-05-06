"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  StoreIcon,
  DownloadIcon,
  StarIcon,
  SearchIcon,
  PuzzleIcon,
  WrenchIcon,
  LayoutTemplateIcon,
  BotIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  Loader2Icon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useI18n } from "@/core/i18n/hooks";
import { useMarketplaceItems, useMarketplaceStats, useMarketplaceCategories } from "@/core/marketplace";
import type { MarketplaceItem } from "@/core/marketplace";

// ============================================================
// Components
// ============================================================

function TypeIcon({ type }: { type: MarketplaceItem["type"] }) {
  switch (type) {
    case "plugin":
      return <PuzzleIcon className="h-4 w-4" />;
    case "skill":
      return <WrenchIcon className="h-4 w-4" />;
    case "template":
      return <LayoutTemplateIcon className="h-4 w-4" />;
    case "agent":
      return <BotIcon className="h-4 w-4" />;
  }
}

function TypeColor(type: MarketplaceItem["type"]): string {
  switch (type) {
    case "plugin":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "skill":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "template":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "agent":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function ItemCard({
  item,
  onInstall,
  onUninstall,
  onView,
  installing,
}: {
  item: MarketplaceItem;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onView: (item: MarketplaceItem) => void;
  installing: string | null;
}) {
  const isInstalling = installing === item.id;
  const isInstalled = item.installStatus === "installed";
  const isError = item.installStatus === "error";

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(item)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${TypeColor(item.type)}`}>
              <TypeIcon type={item.type} />
            </div>
            <div>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <CardDescription className="text-xs">
                v{item.version} by {item.author}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {item.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <StarRating rating={item.rating} count={item.ratingCount} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <DownloadIcon className="h-3 w-3" />
              {item.downloads.toLocaleString()}
            </span>
            <Button
              size="sm"
              variant={isInstalled ? "outline" : "default"}
              className="h-7 text-xs"
              disabled={isInstalling || item.installStatus === "installing" || item.installStatus === "uninstalling"}
              onClick={(e) => {
                e.stopPropagation();
                if (isInstalled) {
                  onUninstall(item.id);
                } else {
                  onInstall(item.id);
                }
              }}
            >
              {isInstalling ? (
                <Loader2Icon className="h-3 w-3 mr-1 animate-spin" />
              ) : isError ? (
                <AlertCircleIcon className="h-3 w-3 mr-1 text-red-500" />
              ) : isInstalled ? (
                <CheckCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <DownloadIcon className="h-3 w-3 mr-1" />
              )}
              {isInstalling
                ? "Working..."
                : isError
                ? "Error"
                : isInstalled
                ? "Installed"
                : "Install"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ItemDetailDialog({
  item,
  open,
  onClose,
  onInstall,
  onUninstall,
  installing,
}: {
  item: MarketplaceItem | null;
  open: boolean;
  onClose: () => void;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  installing: string | null;
}) {
  if (!item) return null;

  const isInstalling = installing === item.id;
  const isInstalled = item.installStatus === "installed";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${TypeColor(item.type)}`}>
              <TypeIcon type={item.type} />
            </div>
            <div>
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>
                v{item.version} by{" "}
                <span className="flex items-center gap-1 inline-flex">
                  <UserIcon className="h-3 w-3" />
                  {item.author}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Rating</div>
              <StarRating rating={item.rating} count={item.ratingCount} />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Downloads</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <DownloadIcon className="h-3.5 w-3.5" />
                {item.downloads.toLocaleString()}
              </div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Category</div>
              <div className="text-sm font-medium">{item.category}</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Size</div>
              <div className="text-sm font-medium">{formatBytes(item.size)}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <TagIcon className="h-3 w-3" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {item.dependencies.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Dependencies</div>
              <div className="flex flex-wrap gap-1.5">
                {item.dependencies.map((dep) => (
                  <Badge key={dep.id} variant="secondary" className="text-xs">
                    {dep.id} {dep.versionRange} {dep.optional && "(optional)"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.permissions.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Permissions</div>
              <div className="flex flex-wrap gap-1.5">
                {item.permissions.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-muted-foreground mb-1">Compatibility</div>
            <div className="flex gap-1.5">
              <Badge variant="secondary" className="text-xs">
                v{item.compatibility.minAppVersion}+
              </Badge>
              {item.compatibility.platforms.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              variant={isInstalled ? "outline" : "default"}
              disabled={isInstalling}
              onClick={() => {
                if (isInstalled) {
                  onUninstall(item.id);
                } else {
                  onInstall(item.id);
                }
              }}
            >
              {isInstalling ? (
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
              ) : isInstalled ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Installed
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Install
                </>
              )}
            </Button>
            <Button variant="outline" size="icon">
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function MarketplacePage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "rated" | "recent" | "name">("popular");
  const [detailItem, setDetailItem] = useState<MarketplaceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);

  const filter = {
    type: selectedType === "all" ? undefined : selectedType,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    sortBy,
  };

  const { data: itemsData, isLoading: itemsLoading, error: itemsError, refresh: refreshItems } = useMarketplaceItems(filter);
  const { data: statsData, refresh: refreshStats } = useMarketplaceStats();
  const { data: categoriesData } = useMarketplaceCategories();

  const localItems = itemsData?.items ?? [];

  const handleInstall = useCallback(async (id: string) => {
    setInstalling(id);
    // Backend-driven install not yet supported — simulate for now
    setTimeout(() => {
      setInstalling(null);
      refreshItems();
      refreshStats();
    }, 1000);
  }, [refreshItems, refreshStats]);

  const handleUninstall = useCallback(async (id: string) => {
    setInstalling(id);
    setTimeout(() => {
      setInstalling(null);
      refreshItems();
      refreshStats();
    }, 800);
  }, [refreshItems, refreshStats]);

  const handleView = (item: MarketplaceItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const stats = useMemo(() => {
    if (statsData) return statsData;
    return {
      totalItems: localItems.length,
      installedCount: localItems.filter((i) => i.installStatus === "installed").length,
      totalPlugins: localItems.filter((i) => i.type === "plugin").length,
      totalSkills: localItems.filter((i) => i.type === "skill").length,
      totalTemplates: localItems.filter((i) => i.type === "template").length,
      totalAgents: localItems.filter((i) => i.type === "agent").length,
    };
  }, [statsData, localItems]);

  const categories = useMemo(() => {
    if (categoriesData?.categories?.length) {
      return ["all", ...categoriesData.categories];
    }
    const cats = new Set<string>();
    localItems.forEach((i) => cats.add(i.category));
    return ["all", ...Array.from(cats).sort()];
  }, [localItems, categoriesData]);

  const filteredItems = useMemo(() => {
    let result = [...localItems];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedType !== "all") {
      result = result.filter((i) => i.type === selectedType);
    }

    if (selectedCategory !== "all") {
      result = result.filter((i) => i.category === selectedCategory);
    }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case "rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "recent":
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [localItems, searchQuery, selectedType, selectedCategory, sortBy]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <StoreIcon className="h-6 w-6" />
            Agent Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and install plugins, skills, templates, and agents from the community
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refreshItems()} disabled={itemsLoading}>
          <RefreshCwIcon className={`h-4 w-4 mr-1 ${itemsLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalItems || 0}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.installedCount || 0}</div>
            <div className="text-xs text-muted-foreground">Installed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalPlugins || 0}</div>
            <div className="text-xs text-muted-foreground">Plugins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalSkills || 0}</div>
            <div className="text-xs text-muted-foreground">Skills</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalTemplates || 0}</div>
            <div className="text-xs text-muted-foreground">Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalAgents || 0}</div>
            <div className="text-xs text-muted-foreground">Agents</div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {itemsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircleIcon className="h-5 w-5" />
          <span>Failed to load marketplace items: {itemsError.message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="plugin">Plugins</SelectItem>
            <SelectItem value="skill">Skills</SelectItem>
            <SelectItem value="template">Templates</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rated">Highest Rated</SelectItem>
            <SelectItem value="recent">Recently Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs + Grid */}
      <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="plugin" className="flex items-center gap-1">
            <PuzzleIcon className="h-3.5 w-3.5" />
            Plugins
          </TabsTrigger>
          <TabsTrigger value="skill" className="flex items-center gap-1">
            <WrenchIcon className="h-3.5 w-3.5" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-1">
            <LayoutTemplateIcon className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="agent" className="flex items-center gap-1">
            <BotIcon className="h-3.5 w-3.5" />
            Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-4">
          {itemsLoading && localItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2Icon className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
              <p className="text-lg font-medium">Loading marketplace...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <StoreIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onInstall={handleInstall}
                  onUninstall={handleUninstall}
                  onView={handleView}
                  installing={installing}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <ItemDetailDialog
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        installing={installing}
      />
    </div>
  );
}
