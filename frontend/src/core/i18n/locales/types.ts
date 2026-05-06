import type { LucideIcon } from "lucide-react";

export interface Translations {
  // Locale meta
  locale: {
    localName: string;
  };

  // Common
  common: {
    home: string;
    settings: string;
    delete: string;
    rename: string;
    share: string;
    openInNewWindow: string;
    close: string;
    more: string;
    search: string;
    download: string;
    thinking: string;
    artifacts: string;
    public: string;
    custom: string;
    notAvailableInDemoMode: string;
    loading: string;
    version: string;
    lastUpdated: string;
    code: string;
    preview: string;
    cancel: string;
    save: string;
    saving: string;
    install: string;
    create: string;
    export: string;
    exportAsMarkdown: string;
    exportAsJSON: string;
    exportSuccess: string;
  };

  // Welcome
  welcome: {
    greeting: string;
    description: string;
    createYourOwnSkill: string;
    createYourOwnSkillDescription: string;
  };

  // Clipboard
  clipboard: {
    copyToClipboard: string;
    copiedToClipboard: string;
    failedToCopyToClipboard: string;
    linkCopied: string;
  };

  // Input Box
  inputBox: {
    placeholder: string;
    createSkillPrompt: string;
    addAttachments: string;
    mode: string;
    flashMode: string;
    flashModeDescription: string;
    reasoningMode: string;
    reasoningModeDescription: string;
    proMode: string;
    proModeDescription: string;
    ultraMode: string;
    ultraModeDescription: string;
    reasoningEffort: string;
    reasoningEffortMinimal: string;
    reasoningEffortMinimalDescription: string;
    reasoningEffortLow: string;
    reasoningEffortLowDescription: string;
    reasoningEffortMedium: string;
    reasoningEffortMediumDescription: string;
    reasoningEffortHigh: string;
    reasoningEffortHighDescription: string;
    searchModels: string;
    surpriseMe: string;
    surpriseMePrompt: string;
    followupLoading: string;
    followupConfirmTitle: string;
    followupConfirmDescription: string;
    followupConfirmAppend: string;
    followupConfirmReplace: string;
    suggestions: {
      suggestion: string;
      prompt: string;
      icon: LucideIcon;
    }[];
    suggestionsCreate: (
      | {
          suggestion: string;
          prompt: string;
          icon: LucideIcon;
        }
      | {
          type: "separator";
        }
    )[];
  };

  // Sidebar
  sidebar: {
    recentChats: string;
    newChat: string;
    chats: string;
    demoChats: string;
    agents: string;
    dashboard: string;
    health: string;
    collaboration: string;
    knowledgeGraph: string;
    knowledgeBase: string;
    scheduler: string;
    reasoning: string;
    memory: string;
    tools: string;
    audit: string;
    plugins: string;
    security: string;
    performance: string;
    shortcuts: string;
    theme: string;
    notifications: string;
    dataManager: string;
    search: string;
    commandPalette: string;
    templates: string;
    toolTester: string;
    pluginMonitor: string;
    realtimeDashboard: string;
    backup: string;
    charts: string;
    marketplace: string;
    pluginSdk: string;
    sessionExport: string;
    agentContext: string;
    alerts: string;
  };

  // Agents
  agents: {
    title: string;
    description: string;
    newAgent: string;
    emptyTitle: string;
    emptyDescription: string;
    chat: string;
    delete: string;
    deleteConfirm: string;
    deleteSuccess: string;
    newChat: string;
    createPageTitle: string;
    createPageSubtitle: string;
    nameStepTitle: string;
    nameStepHint: string;
    nameStepPlaceholder: string;
    nameStepContinue: string;
    nameStepInvalidError: string;
    nameStepAlreadyExistsError: string;
    nameStepCheckError: string;
    nameStepBootstrapMessage: string;
    agentCreated: string;
    startChatting: string;
    backToGallery: string;
    templates: {
      title: string;
      description: string;
      chooseTemplate: string;
      customAgent: string;
      customAgentDescription: string;
      createFromTemplate: string;
      preview: string;
      category: string;
      configuration: string;
      model: string;
      tools: string;
      soulPreview: string;
      cancel: string;
      createAgent: string;
      createSuccess: string;
      createFailed: string;
      agentName: string;
      builtin: string;
      noTemplates: string;
      noTemplatesDescription: string;
    };
    searchPlaceholder: string;
    selectedCount: string;
    compareBtn: string;
    cancelCompare: string;
    importAgent: string;
    exportAgent: string;
    importSuccess: string;
    exportSuccess: string;
    importFailed: string;
    exportFailed: string;
    importDialogDescription: string;
    importDropHint: string;
    importSelectFile: string;
    importing: string;
    created: string;
    skipped: string;
    // Batch operations
    batchSelect: string;
    batchSelectAll: string;
    batchCancel: string;
    batchExport: string;
    batchImport: string;
    batchImportTitle: string;
    batchImportDescription: string;
    batchImportDropHint: string;
    batchImportSelectFile: string;
    batchImportTotal: string;
    batchImportImported: string;
    batchImportSkipped: string;
    batchImportFailedLabel: string;
    batchSelectedCount: string;
    batchExportSuccess: string;
    batchExportFailed: string;
    batchImportSuccess: string;
    batchImportPartial: string;
    batchImportFailed: string;
    batchDelete: string;
    batchDeleteTitle: string;
    batchDeleteDescription: string;
    batchDeleteSuccess: string;
    batchDeletePartial: string;
    batchDeleteFailed: string;
    sortBy: string;
    sortOptions: {
      nameAsc: string;
      nameDesc: string;
      modelAsc: string;
      modelDesc: string;
      chatsAsc: string;
      chatsDesc: string;
      lastActiveAsc: string;
      lastActiveDesc: string;
    };
    compare: {
      title: string;
      subtitle: string;
      selectAgents: string;
      selectAgentsDescription: string;
      backToAgents: string;
      changeSelection: string;
      totalChats: string;
      totalMessages: string;
      toolCalls: string;
      avgResponseTime: string;
      weeklyTrend: string;
      weeklyTrendDescription: string;
      toolUsageComparison: string;
      toolUsageDescription: string;
      summary: string;
      agent: string;
      chats: string;
      messages: string;
      tools: string;
      avgTime: string;
      lastActive: string;
      noToolData: string;
      p50: string;
      p95: string;
      p99: string;
      justNow: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
      never: string;
    };
    detail: {
      online: string;
      offline: string;
      busy: string;
      unknown: string;
      edit: string;
      save: string;
      cancel: string;
      delete: string;
      newChat: string;
      totalChats: string;
      messages: string;
      toolCalls: string;
      avgResponse: string;
      avgResponseDesc: string;
      overview: string;
      analytics: string;
      chatHistory: string;
      description: string;
      descriptionPlaceholder: string;
      noDescription: string;
      model: string;
      modelPlaceholder: string;
      defaultModel: string;
      toolGroups: string;
      toolGroupsPlaceholder: string;
      noToolGroups: string;
      soul: string;
      soulPlaceholder: string;
      noPersonality: string;
      weeklyActivity: string;
      messagesPerDay: string;
      topTools: string;
      mostUsedTools: string;
      calls: string;
      responseTimeHistory: string;
      responseTimeHistoryDesc: string;
      responseTimePercentiles: string;
      responseTimePercentilesDesc: string;
      responseTimePercentilesNoData: string;
      responseTimePercentilesNoDataHint: string;
      timingDecomposition: string;
      timingDecompositionDesc: string;
      gatewayHttpLabel: string;
      langgraphProcLabel: string;
      gatewayOverheadLabel: string;
      timingDecompositionNoData: string;
      timingDecompositionNoDataHint: string;
      conversationsCount: string;
      conversationOne: string;
      searchConversations: string;
      noConversations: string;
      noMatchingConversations: string;
      startChat: string;
      threadId: string;
      never: string;
      justNow: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
      versions: string;
      versionHistory: string;
      versionHistoryDescription: string;
      noVersions: string;
      noVersionsHint: string;
      restore: string;
      restoreTitle: string;
      restoreDescription: string;
      restoreConfirm: string;
      restoreCancel: string;
      restoreSuccess: string;
      restoreFailed: string;
      viewVersion: string;
      hideVersion: string;
      versionConfig: string;
      versionSoul: string;
      versionCurrent: string;
      diffNoChanges: string;
      deleteTitle: string;
      deleteDescription: string;
      notFound: string;
      notFoundDesc: string;
      backToAgents: string;
      updateSuccess: string;
      updateFailed: string;
      deleteSuccessToast: string;
      deleteFailedToast: string;
      versionDiffTitle: string;
      versionDiffDescription: string;
      versionDiffSoulModified: string;
      versionDiffConfig: string;
      versionDiffNoConfig: string;
      versionDiffModified: string;
      versionDiffUnchanged: string;
      versionDiffNoSoul: string;
      versionDiffIdentical: string;
      versionDiffFailed: string;
      versionCompareBtn: string;
      versionCompareTitle: string;
      versionCompareClose: string;
      fieldLabelDescription: string;
      fieldLabelModel: string;
      fieldLabelTools: string;
      fieldLabelSoul: string;
      close: string;
    };
    share: {
      title: string;
      description: string;
      createLink: string;
      linkCopied: string;
      activeLinks: string;
      noLinks: string;
      copyLink: string;
      revoke: string;
      revokeSuccess: string;
      expires: string;
    };
  };

  // Breadcrumb
  breadcrumb: {
    workspace: string;
    chats: string;
  };

  // Workspace
  workspace: {
    officialWebsite: string;
    githubTooltip: string;
    settingsAndMore: string;
    visitGithub: string;
    reportIssue: string;
    contactUs: string;
    about: string;
  };

  // Conversation
  conversation: {
    noMessages: string;
    startConversation: string;
  };

  // Chats
  chats: {
    searchChats: string;
  };

  // Page titles (document title)
  pages: {
    appName: string;
    chats: string;
    newChat: string;
    untitled: string;
  };

  // Tool calls
  toolCalls: {
    moreSteps: (count: number) => string;
    lessSteps: string;
    executeCommand: string;
    presentFiles: string;
    needYourHelp: string;
    useTool: (toolName: string) => string;
    searchForRelatedInfo: string;
    searchForRelatedImages: string;
    searchFor: (query: string) => string;
    searchForRelatedImagesFor: (query: string) => string;
    searchOnWebFor: (query: string) => string;
    viewWebPage: string;
    listFolder: string;
    readFile: string;
    writeFile: string;
    clickToViewContent: string;
    writeTodos: string;
    skillInstallTooltip: string;
  };

  // Uploads
  uploads: {
    uploading: string;
    uploadingFiles: string;
  };

  // Subtasks
  subtasks: {
    subtask: string;
    executing: (count: number) => string;
    in_progress: string;
    completed: string;
    failed: string;
  };

  // Token Usage
  tokenUsage: {
    title: string;
    input: string;
    output: string;
    total: string;
  };
  
  // Shortcuts
  shortcuts: {
    searchActions: string;
    noResults: string;
    actions: string;
    keyboardShortcuts: string;
    keyboardShortcutsDescription: string;
    openCommandPalette: string;
    toggleSidebar: string;
  };

  // Agent Context Manager
  agentContext: {
    title: string;
    description: string;
    refresh: string;
    newSession: string;
    stats: {
      sessions: string;
      messages: string;
      totalTokens: string;
      summaries: string;
      avgMsgPerSession: string;
    };
    error: {
      loadFailed: string;
    };
    searchPlaceholder: string;
    empty: {
      noSessions: string;
      noMatching: string;
      noSessionsHint: string;
      noMatchingHint: string;
      createSession: string;
    };
    create: {
      title: string;
      description: string;
      placeholder: string;
      success: string;
      failure: string;
      creationFailed: string;
    };
    rename: {
      title: string;
      success: string;
      failure: string;
    };
    delete: {
      title: string;
      confirm: string;
      success: string;
      failure: string;
    };
    systemPrompt: {
      title: string;
      description: string;
      placeholder: string;
      success: string;
      failure: string;
    };
    compress: {
      title: string;
      description: string;
      tokenUsage: string;
      messageCount: string;
      currentSummary: string;
      keyPoints: string;
      compressNow: string;
      success: string;
      failure: string;
    };
    inherit: {
      title: string;
      description: string;
      targetSession: string;
      noSessionsAvailable: string;
      includeSummary: string;
      includeKeyPoints: string;
      includeActionItems: string;
      messageCount: string;
      inherit: string;
      success: string;
      failure: string;
    };
    buildContext: {
      title: string;
      description: string;
      systemPrompt: string;
      tokenCount: string;
      messageCount: string;
      noData: string;
    };
    detail: {
      preview: string;
      prompt: string;
      compress: string;
      inherit: string;
      inherited: string;
      tokenUsage: string;
      messageCount: string;
      critical: string;
      warning: string;
      healthy: string;
      messages: string;
      searchMessages: string;
      noMessages: string;
      noMatchingMessages: string;
    };
    list: {
      inherited: string;
      messageCount: string;
      tokenCount: string;
    };
  };

  // Settings
  settings: {
    title: string;
    description: string;
    sections: {
      appearance: string;
      memory: string;
      tools: string;
      skills: string;
      notification: string;
      about: string;
    };
    memory: {
      title: string;
      description: string;
      empty: string;
      rawJson: string;
      clearAll: string;
      clearAllConfirmTitle: string;
      clearAllConfirmDescription: string;
      clearAllSuccess: string;
      factDeleteConfirmTitle: string;
      factDeleteConfirmDescription: string;
      factDeleteSuccess: string;
        noFacts: string;
        summaryReadOnly: string;
        memoryFullyEmpty: string;
        factPreviewLabel: string;
        searchPlaceholder: string;
        filterAll: string;
        filterFacts: string;
        filterSummaries: string;
        noMatches: string;
        markdown: {
        overview: string;
        userContext: string;
        work: string;
        personal: string;
        topOfMind: string;
        historyBackground: string;
        recentMonths: string;
        earlierContext: string;
        longTermBackground: string;
        updatedAt: string;
        facts: string;
        empty: string;
        table: {
          category: string;
          confidence: string;
          confidenceLevel: {
            veryHigh: string;
            high: string;
            normal: string;
            unknown: string;
          };
          content: string;
          source: string;
          createdAt: string;
          view: string;
        };
      };
    };
    appearance: {
      themeTitle: string;
      themeDescription: string;
      system: string;
      light: string;
      dark: string;
      systemDescription: string;
      lightDescription: string;
      darkDescription: string;
      languageTitle: string;
      languageDescription: string;
    };
    tools: {
      title: string;
      description: string;
    };
    skills: {
      title: string;
      description: string;
      createSkill: string;
      emptyTitle: string;
      emptyDescription: string;
      emptyButton: string;
    };
    notification: {
      title: string;
      description: string;
      requestPermission: string;
      deniedHint: string;
      testButton: string;
      testTitle: string;
      testBody: string;
      notSupported: string;
      disableNotification: string;
    };
    acknowledge: {
      emptyTitle: string;
      emptyDescription: string;
    };
  };

  // Alerts
  alerts: {
    title: string;
    subtitle: string;
    evaluateNow: string;
    evaluateOk: string;
    evaluateWouldFire: string;
    evaluateFailed: string;
    configuredAgents: string;
    enabledCount: string;
    activeAlerts: string;
    agentsWithHistory: string;
    defaultThreshold: string;
    p95Default: string;
    tabConfigs: string;
    tabHistory: string;
    noConfigs: string;
    noConfigsDesc: string;
    allClear: string;
    allClearDesc: string;
    agentsWithAlerts: string;
    configTitle: string;
    configDesc: string;
    configSaved: string;
    configSaveFailed: string;
    enableAlerting: string;
    p95Threshold: string;
    p95ThresholdHint: string;
    cooldownMinutes: string;
    cooldownHint: string;
    severity: string;
    severityCritical: string;
    severityWarning: string;
    severityInfo: string;
    threshold: string;
    cooldown: string;
    lastFired: string;
    lastFiredAt: string;
    thresholdAt: string;
    firing: string;
    noHistory: string;
  };

  // Realtime Dashboard
  realtimeDashboard: {
    title: string;
    subtitle: string;
    liveData: string;
    mockData: string;
    backendUnavailable: string;
    live: string;
    paused: string;
    connected: string;
    disconnected: string;
    activeSessions: string;
    activeAgents: string;
    memoryEntries: string;
    toolCalls: string;
    cpuUsage: string;
    memoryUsage: string;
    healthStatus: string;
    systemResources: string;
    memory: string;
    disk: string;
    network: string;
    liveEvents: string;
    clear: string;
    noEvents: string;
    events: string;
    streaming: string;
    offline: string;
    quickStats: string;
    totalAgents: string;
    totalSessions: string;
    totalMessages: string;
    totalAlerts: string;
  };

  // Knowledge Base
  knowledgeBase: {
    pageTitle: string;
    reindex: string;
    upload: {
      title: string;
      description: string;
      dragDrop: string;
      placeholder: string;
      remove: string;
      uploadButton: string;
    };
    search: {
      title: string;
      aiPowered: string;
      modeTfidf: string;
      modeHybrid: string;
      modeAi: string;
      placeholder: string;
      placeholderAi: string;
      button: string;
      balance: string;
      results: string;
      noResults: string;
      tfidfLabel: string;
      aiLabel: string;
    };
    documents: {
      title: string;
      empty: string;
      emptySearch: string;
      filterPlaceholder: string;
      statsLabel: string;
      chunkLabel: string;
      chunkItem: string;
      batchSelect: string;
      cancel: string;
      selectAll: string;
      selected: string;
      batchDelete: string;
      batchUpdate: string;
      batchUpdateTitle: string;
      batchUpdateModeSet: string;
      batchUpdateModeAdd: string;
      batchUpdateModeRemove: string;
      batchUpdateTagsLabel: string;
      batchUpdateCategoryLabel: string;
      batchUpdateSuccess: string;
      reindexDoc: string;
      reindexing: string;
      reindexSuccess: string;
      relatedEntities: string;
    };
    stats: {
      documents: string;
      chunks: string;
      totalChars: string;
      avgChunk: string;
      fileTypes: string;
      categories: string;
      tags: string;
    };
    categories: {
      all: string;
      general: string;
      code: string;
      documentation: string;
      data: string;
      research: string;
      other: string;
    };
    tags: {
      all: string;
      noTags: string;
      addTagHint: string;
    };
    embedding: {
      checking: string;
      active: string;
      detail: string;
      notConfigured: string;
      setKey: string;
    };
    edit: {
      title: string;
      titleLabel: string;
      titlePlaceholder: string;
      categoryLabel: string;
      tagsLabel: string;
      tagsPlaceholder: string;
      save: string;
      cancel: string;
      saved: string;
    };
  };
  // Backup
  backup: {
    title: string;
    subtitle: string;
    stats: string;
    totalBackups: string;
    totalSize: string;
    autoBackup: string;
    running: string;
    paused: string;
    nextBackup: string;
    configuration: string;
    enableAuto: string;
    interval: string;
    hour: string;
    hours: string;
    week: string;
    maxBackups: string;
    path: string;
    includeComponents: string;
    sessions: string;
    sessionsDesc: string;
    workflows: string;
    workflowsDesc: string;
    knowledgeGraph: string;
    knowledgeGraphDesc: string;
    config: string;
    configDesc: string;
    memories: string;
    memoriesDesc: string;
    plugins: string;
    pluginsDesc: string;
    save: string;
    saved: string;
    createNow: string;
    creating: string;
    history: string;
    items: string;
    noBackups: string;
    restore: string;
    restoreConfirm: string;
    restoreWarning: string;
    restoreComponents: string;
    mergeStrategy: string;
    confirmRestore: string;
    strategy: {
      overwrite: string;
      merge: string;
      skip: string;
    };
    restoreProgress: string;
    restoreSuccess: string;
    restoreFailed: string;
    restoreNoArchive: string;
  };
}
