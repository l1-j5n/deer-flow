/**
 * DeerFlow Electron - Settings Window
 *
 * Native Electron settings panel for configuring:
 * - Model configurations (LLM providers)
 * - API keys
 * - Service management
 * - First-run setup
 */

export interface ModelConfig {
  name: string;
  display_name?: string;
  use: string;
  model: string;
  api_key?: string;
  api_base?: string;
  base_url?: string;
  gemini_api_key?: string;
  max_tokens?: number;
  temperature?: number;
  supports_thinking?: boolean;
  supports_vision?: boolean;
}

export interface ModelProvider {
  id: string;
  name: string;
  use: string;
  modelDefault: string;
  fields: Array<{ key: string; label: string; type: "text" | "number"; placeholder?: string; envVar?: string }>;
  description: string;
}

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: "openai",
    name: "OpenAI (GPT-4/GPT-4o)",
    use: "langchain_openai:ChatOpenAI",
    modelDefault: "gpt-4o",
    fields: [
      { key: "model", label: "Model Name", type: "text", placeholder: "gpt-4o or gpt-4" },
      { key: "api_key", label: "API Key", type: "text", envVar: "OPENAI_API_KEY" },
      { key: "max_tokens", label: "Max Tokens", type: "number" },
      { key: "temperature", label: "Temperature", type: "number" },
    ],
    description: "OpenAI's most advanced models with reasoning capabilities",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    use: "langchain_anthropic:ChatAnthropic",
    modelDefault: "claude-3-5-sonnet-20241022",
    fields: [
      { key: "model", label: "Model Name", type: "text", placeholder: "claude-3-5-sonnet-20241022" },
      { key: "api_key", label: "API Key", type: "text", envVar: "ANTHROPIC_API_KEY" },
      { key: "max_tokens", label: "Max Tokens", type: "number" },
    ],
    description: "Anthropic's Claude models with excellent reasoning",
  },
  {
    id: "deepseek",
    name: "DeepSeek V3",
    use: "deerflow.models.patched_deepseek:PatchedChatDeepSeek",
    modelDefault: "deepseek-reasoner",
    fields: [
      { key: "model", label: "Model Name", type: "text", placeholder: "deepseek-reasoner" },
      { key: "api_key", label: "API Key", type: "text", envVar: "DEEPSEEK_API_KEY" },
      { key: "max_tokens", label: "Max Tokens", type: "number" },
    ],
    description: "DeepSeek's reasoning-focused models",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    use: "langchain_google_genai:ChatGoogleGenerativeAI",
    modelDefault: "gemini-2.5-pro",
    fields: [
      { key: "model", label: "Model Name", type: "text", placeholder: "gemini-2.5-pro" },
      { key: "gemini_api_key", label: "API Key", type: "text", envVar: "GEMINI_API_KEY" },
      { key: "max_tokens", label: "Max Tokens", type: "number" },
    ],
    description: "Google's Gemini models with multimodal capabilities",
  },
  {
    id: "openrouter",
    name: "OpenRouter (Multi-Model)",
    use: "langchain_openai:ChatOpenAI",
    modelDefault: "google/gemini-2.5-flash-preview",
    fields: [
      { key: "model", label: "Model Name", type: "text", placeholder: "google/gemini-2.5-flash-preview" },
      { key: "api_key", label: "API Key", type: "text", envVar: "OPENAI_API_KEY" },
      { key: "base_url", label: "API Base URL", type: "text", placeholder: "https://openrouter.ai/api/v1" },
    ],
    description: "Access multiple LLM providers through OpenRouter",
  },
  {
    id: "minimax",
    name: "MiniMax M2.5",
    use: "langchain_openai:ChatOpenAI",
    modelDefault: "MiniMax-M2.5",
    fields: [
      { key: "model", label: "Model Name", type: "text", placeholder: "MiniMax-M2.5" },
      { key: "api_key", label: "API Key", type: "text", envVar: "MINIMAX_API_KEY" },
      { key: "base_url", label: "API Base URL", type: "text", placeholder: "https://api.minimax.io/v1" },
      { key: "temperature", label: "Temperature (0.0-1.0)", type: "number" },
    ],
    description: "MiniMax models with 204K context window",
  },
];

/**
 * Get HTML content for settings window
 */
export function getSettingsHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Settings</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 240px;
      background: #111;
      border-right: 1px solid #222;
      padding: 1.5rem 0;
      display: flex;
      flex-direction: column;
    }

    .sidebar-title {
      padding: 0 1.5rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #666;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .nav-item {
      padding: 0.8rem 1.5rem;
      cursor: pointer;
      color: #888;
      transition: all 0.2s;
      font-size: 0.9rem;
      border-left: 2px solid transparent;
    }

    .nav-item:hover {
      background: #1a1a1a;
      color: #ccc;
    }

    .nav-item.active {
      background: #1f1f2e;
      color: #818cf8;
      border-left-color: #6366f1;
    }

    /* Main Content */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    .page {
      display: none;
    }

    .page.active {
      display: block;
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #888;
      font-size: 0.95rem;
      margin-bottom: 2rem;
    }

    /* Model List */
    .model-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .model-card {
      background: #111;
      border: 1px solid #222;
      border-radius: 10px;
      padding: 1rem;
      transition: all 0.2s;
    }

    .model-card:hover {
      border-color: #333;
      background: #161616;
    }

    .model-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .model-name {
      font-weight: 600;
      font-size: 1rem;
      color: #e5e5e5;
    }

    .model-provider {
      font-size: 0.8rem;
      color: #888;
      margin-top: 0.2rem;
    }

    .model-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: transparent;
      border: 1px solid #333;
      color: #666;
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #222;
      color: #e5e5e5;
      border-color: #444;
    }

    .btn-icon.delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: #ef4444;
    }

    /* Buttons */
    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-secondary {
      background: #222;
      color: #e5e5e5;
      border: 1px solid #333;
    }

    .btn-secondary:hover {
      background: #2a2a2a;
    }

    /* Add Model Form */
    .add-model-section {
      background: linear-gradient(135deg, #1a1a2e 0%, #111 100%);
      border: 1px solid #333;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-row {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 0.4rem;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 6px;
      color: #e5e5e5;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    .form-input::placeholder {
      color: #444;
    }

    /* Status Indicators */
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
      margin-left: 0.5rem;
    }

    .status-badge.configured {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .status-badge.missing {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #666;
    }

    .empty-state .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.1rem;
      color: #888;
      margin-bottom: 0.5rem;
    }

    /* Service Status */
    .service-status {
      background: #111;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .service-row {
      display: flex;
      align-items: center;
      padding: 0.8rem 1rem;
      border-bottom: 1px solid #222;
      transition: background 0.2s;
    }

    .service-row:last-child {
      border-bottom: none;
    }

    .service-row:hover {
      background: #161616;
    }

    .service-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .service-indicator.healthy {
      background: #22c55e;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
    }

    .service-indicator.error {
      background: #ef4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }

    .service-indicator.starting {
      background: #eab308;
      animation: blink 1.2s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .service-name {
      flex: 1;
      font-weight: 500;
      color: #e5e5e5;
    }

    .service-status-text {
      font-size: 0.8rem;
      color: #666;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal {
      background: #111;
      border: 1px solid #333;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      padding: 2rem;
      animation: modalIn 0.2s ease-out;
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #e5e5e5;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #666;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: #222;
      color: #e5e5e5;
    }

    .modal-body {
      margin-bottom: 1.5rem;
    }

    .modal-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    /* Toast Notifications */
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .toast {
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 0.8rem 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    .toast.success { border-color: #22c55e; }
    .toast.error { border-color: #ef4444; }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast-icon {
      font-size: 1.2rem;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9rem;
    }

    /* Loading */
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #333;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <nav class="sidebar">
    <div class="sidebar-title">Settings</div>
    <div class="nav-item active" data-page="models">🤖 Models</div>
    <div class="nav-item" data-page="services">⚡ Services</div>
    <div class="nav-item" data-page="about">ℹ️ About</div>
  </nav>

  <!-- Main Content -->
  <main class="main">
    <div class="content-area">
      <!-- Models Page -->
      <div id="page-models" class="page active">
        <h1>AI Model Configuration</h1>
        <p class="subtitle">Configure LLM models for the agent to use. Add at least one model to get started.</p>

        <!-- Add Model Button -->
        <button class="btn btn-primary" id="btn-add-model" style="margin-bottom: 1.5rem;">
          + Add New Model
        </button>

        <!-- Model List -->
        <div id="model-list" class="model-list">
          <!-- Models will be rendered here -->
        </div>
      </div>

      <!-- Services Page -->
      <div id="page-services" class="page">
        <h1>Backend Services</h1>
        <p class="subtitle">Monitor and manage DeerFlow's backend services.</p>

        <div id="service-status-list">
          <!-- Services will be rendered here -->
        </div>

        <div style="margin-top: 2rem;">
          <button class="btn btn-primary" id="btn-restart-services">
            🔄 Restart All Services
          </button>
        </div>
      </div>

      <!-- About Page -->
      <div id="page-about" class="page">
        <h1>About DeerFlow</h1>
        <p class="subtitle">Intelligent Agent Platform - Electron Desktop Edition</p>

        <div style="background: #111; border-radius: 10px; padding: 1.5rem; border: 1px solid #222;">
          <div style="margin-bottom: 1rem;">
            <strong style="color: #888; display: block; margin-bottom: 0.3rem; font-size: 0.85rem;">VERSION</strong>
            <span style="font-size: 1.1rem; color: #e5e5e5;">DeerFlow v2.0</span>
          </div>

          <div style="margin-bottom: 1rem;">
            <strong style="color: #888; display: block; margin-bottom: 0.3rem; font-size: 0.85rem;">ELECTRON</strong>
            <span style="font-size: 1.1rem; color: #e5e5e5;" id="electron-version">Loading...</span>
          </div>

          <div>
            <strong style="color: #888; display: block; margin-bottom: 0.3rem; font-size: 0.85rem;">PROJECT ROOT</strong>
            <span style="font-size: 0.85rem; color: #666; font-family: monospace;" id="project-root">Loading...</span>
          </div>
        </div>

        <div style="margin-top: 2rem;">
          <button class="btn btn-secondary" onclick="window.electronAPI.shell.openExternal('https://github.com/bytedance/deer-flow')">
            📖 View on GitHub
          </button>
        </div>
      </div>
    </div>
  </main>

  <!-- Add Model Modal -->
  <div id="modal-add-model" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Add AI Model</h2>
        <button class="modal-close" id="btn-close-modal">&times;</button>
      </div>

      <form id="form-add-model">
        <div class="form-row">
          <label class="form-label">Provider</label>
          <select id="input-provider" class="form-select" required>
            ${MODEL_PROVIDERS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label class="form-label">Model Name (internal ID)</label>
          <input type="text" id="input-model-name" class="form-input" placeholder="e.g., my-gpt-4" required>
        </div>

        <div class="form-row">
          <label class="form-label">Display Name</label>
          <input type="text" id="input-display-name" class="form-input" placeholder="e.g., GPT-4 (My Key)">
        </div>

        <div id="dynamic-fields">
          <!-- Provider-specific fields will be added here -->
        </div>

        <div style="margin-top: 1rem; padding: 1rem; background: #1a1a2e; border-radius: 6px; border-left: 3px solid #6366f1;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="input-thinking">
            <span style="font-size: 0.9rem; color: #ccc;">Enable extended thinking (if supported)</span>
          </label>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-model">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Model</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Container -->
  <div id="toast-container" class="toast-container"></div>

  <script>
    // ============================================================
    // State
    // ============================================================
    let models = [];
    let providers = ${JSON.stringify(MODEL_PROVIDERS)};

    // ============================================================
    // DOM Elements
    // ============================================================
    const elements = {
      navItems: document.querySelectorAll('.nav-item'),
      pages: document.querySelectorAll('.page'),
      modelList: document.getElementById('model-list'),
      serviceStatusList: document.getElementById('service-status-list'),
      addModelBtn: document.getElementById('btn-add-model'),
      restartServicesBtn: document.getElementById('btn-restart-services'),
      modal: document.getElementById('modal-add-model'),
      closeModalBtn: document.getElementById('btn-close-modal'),
      cancelModelBtn: document.getElementById('btn-cancel-model'),
      form: document.getElementById('form-add-model'),
      providerSelect: document.getElementById('input-provider'),
      modelNameInput: document.getElementById('input-model-name'),
      displayNameInput: document.getElementById('input-display-name'),
      dynamicFields: document.getElementById('dynamic-fields'),
      thinkingCheckbox: document.getElementById('input-thinking'),
      toastContainer: document.getElementById('toast-container'),
      electronVersion: document.getElementById('electron-version'),
      projectRoot: document.getElementById('project-root'),
    };

    // ============================================================
    // Navigation
    // ============================================================
    elements.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;

        // Update nav active state
        elements.navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Show corresponding page
        elements.pages.forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + page).classList.add('active');

        // Refresh data for the page
        if (page === 'models') refreshModels();
        if (page === 'services') refreshServices();
        if (page === 'about') loadAboutInfo();
      });
    });

    // ============================================================
    // Model Management
    // ============================================================
    async function refreshModels() {
      try {
        const result = await window.electronAPI.config.getModels();
        if (result.success) {
          models = result.models || [];
          renderModelList();
        }
      } catch (err) {
        console.error('Failed to load models:', err);
        showToast('Failed to load models', 'error');
      }
    }

    function renderModelList() {
      if (models.length === 0) {
        elements.modelList.innerHTML = \`
          <div class="empty-state">
            <div class="icon">🤖</div>
            <h3>No models configured</h3>
            <p>Add at least one AI model to get started with DeerFlow.</p>
          </div>
        \`;
        return;
      }

      elements.modelList.innerHTML = models.map(model => {
        const provider = providers.find(p => model.use.includes(p.use.split(':')[1])) || { id: 'custom', name: 'Custom' };
        const hasApiKey = isModelConfigured(model);
        const statusBadge = hasApiKey
          ? '<span class="status-badge configured">✓ Configured</span>'
          : '<span class="status-badge missing">⚠ Missing API Key</span>';

        return \`
          <div class="model-card">
            <div class="model-header">
              <div>
                <div class="model-name">\${model.display_name || model.name}</div>
                <div class="model-provider">\${provider.name}</div>
              </div>
              <div class="model-actions">
                \${statusBadge}
                <button class="btn-icon delete" onclick="deleteModel('\${model.name}')">🗑️</button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function isModelConfigured(model) {
      // Check if model has a non-placeholder API key in env
      const apiKeyField = Object.keys(model).find(k => k.includes('api_key') || k === 'api_key');
      if (!apiKeyField) return false;

      const envVarName = getEnvVarForField(model, apiKeyField);
      if (!envVarName) return false;

      // Check if env var is set and not a placeholder
      return model[apiKeyField] && !model[apiKeyField].startsWith('your-');
    }

    function getEnvVarForField(model, field) {
      const provider = providers.find(p => model.use.includes(p.use.split(':')[1]));
      if (!provider) return null;

      const fieldConfig = provider.fields.find(f => f.key === field);
      return fieldConfig?.envVar || null;
    }

    async function deleteModel(name) {
      if (!confirm(\`Are you sure you want to delete model "\${name}"?\`)) return;

      try {
        const result = await window.electronAPI.config.removeModel(name);
        if (result.success) {
          showToast('Model deleted successfully', 'success');
          refreshModels();
        } else {
          showToast(result.error || 'Failed to delete model', 'error');
        }
      } catch (err) {
        console.error('Failed to delete model:', err);
        showToast('Failed to delete model', 'error');
      }
    }

    // ============================================================
    // Add Model Modal
    // ============================================================
    elements.addModelBtn.addEventListener('click', () => {
      elements.modal.classList.add('active');
      updateDynamicFields();
    });

    elements.closeModalBtn.addEventListener('click', () => {
      elements.modal.classList.remove('active');
    });

    elements.cancelModelBtn.addEventListener('click', () => {
      elements.modal.classList.remove('active');
    });

    elements.providerSelect.addEventListener('change', updateDynamicFields);

    function updateDynamicFields() {
      const providerId = elements.providerSelect.value;
      const provider = providers.find(p => p.id === providerId);

      if (!provider) return;

      // Set default model name
      elements.modelNameInput.placeholder = provider.modelDefault;
      if (elements.modelNameInput.value === '') {
        elements.modelNameInput.value = '';
      }

      // Render provider-specific fields
      elements.dynamicFields.innerHTML = provider.fields.map(field => {
        const inputType = field.type === 'number' ? 'number' : 'text';
        const required = field.key.includes('api_key') ? 'required' : '';
        const placeholder = field.placeholder || '';
        const label = field.label + (field.key.includes('api_key') ? ' (will be saved to .env)' : '');

        return \`
          <div class="form-row">
            <label class="form-label">\${label}</label>
            <input
              type="\${inputType}"
              id="field-\${field.key}"
              class="form-input"
              placeholder="\${placeholder}"
              \${required}
              value="\${field.key === 'model' ? provider.modelDefault : ''}"
            >
          </div>
        \`;
      }).join('');

      // Add description
      if (provider.description) {
        elements.dynamicFields.innerHTML += \`
          <div style="margin: -0.5rem 0 1rem 0; font-size: 0.8rem; color: #888;">
            ℹ️ \${provider.description}
          </div>
        \`;
      }
    }

    elements.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const providerId = elements.providerSelect.value;
      const provider = providers.find(p => p.id === providerId);
      if (!provider) return;

      // Build model config
      const model = {
        name: elements.modelNameInput.value.trim(),
        display_name: elements.displayNameInput.value.trim() || undefined,
        use: provider.use,
        supports_thinking: elements.thinkingCheckbox.checked,
        supports_vision: provider.id !== 'deepseek',
      };

      // Add provider-specific fields
      provider.fields.forEach(field => {
        const input = document.getElementById('field-' + field.key);
        if (input) {
          const value = input.value.trim();
          if (value) {
            model[field.key] = field.type === 'number' ? parseInt(value, 10) : value;

            // If it's an env var field, also save to .env
            if (field.envVar) {
              window.electronAPI.config.setEnvVar(field.envVar, value);
            }
          }
        }
      });

      try {
        const result = await window.electronAPI.config.addModel(model);
        if (result.success) {
          showToast('Model added successfully! Restarting services...', 'success');
          elements.modal.classList.remove('active');
          elements.form.reset();
          refreshModels();
          await window.electronAPI.services.restart();
        } else {
          showToast(result.error || 'Failed to add model', 'error');
        }
      } catch (err) {
        console.error('Failed to add model:', err);
        showToast('Failed to add model', 'error');
      }
    });

    // ============================================================
    // Services
    // ============================================================
    async function refreshServices() {
      try {
        const statuses = await window.electronAPI.services.getStatus();
        renderServiceStatus(statuses);
      } catch (err) {
        console.error('Failed to load service status:', err);
      }
    }

    function renderServiceStatus(statuses) {
      elements.serviceStatusList.innerHTML = statuses.map(s => {
        let statusClass = 'starting';
        let statusText = 'Starting...';

        if (s.ready) {
          statusClass = 'healthy';
          statusText = 'Running';
        } else if (s.error || !s.running) {
          statusClass = 'error';
          statusText = s.error || 'Stopped';
        }

        return \`
          <div class="service-status">
            <div class="service-row">
              <div class="service-indicator \${statusClass}"></div>
              <div class="service-name">\${s.name}</div>
              <div class="service-status-text">\${statusText}</div>
            </div>
          </div>
        \`;
      }).join('');
    }

    elements.restartServicesBtn.addEventListener('click', async () => {
      elements.restartServicesBtn.disabled = true;
      elements.restartServicesBtn.innerHTML = '<div class="spinner"></div> Restarting...';

      try {
        await window.electronAPI.services.restart();
        showToast('Services restarted successfully', 'success');
        setTimeout(refreshServices, 3000); // Refresh after restart
      } catch (err) {
        showToast('Failed to restart services', 'error');
      } finally {
        elements.restartServicesBtn.disabled = false;
        elements.restartServicesBtn.innerHTML = '🔄 Restart All Services';
      }
    });

    // ============================================================
    // About
    // ============================================================
    async function loadAboutInfo() {
      try {
        const version = await window.electronAPI.app.getVersion();
        const projectRoot = await window.electronAPI.app.getProjectRoot();
        elements.electronVersion.textContent = version;
        elements.projectRoot.textContent = projectRoot;
      } catch (err) {
        console.error('Failed to load app info:', err);
      }
    }

    // ============================================================
    // Toast Notifications
    // ============================================================
    function showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = \`toast \${type}\`;
      toast.innerHTML = \`
        <div class="toast-icon">\${type === 'success' ? '✓' : '⚠️'}</div>
        <div class="toast-message">\${message}</div>
      \`;
      elements.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // ============================================================
    // Initialize
    // ============================================================
    (async function init() {
      await refreshModels();
      await refreshServices();
      await loadAboutInfo();
    })();
  </script>
</body>
</html>`;
}
