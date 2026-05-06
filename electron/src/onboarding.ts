/**
 * DeerFlow Electron - Onboarding Wizard
 *
 * First-time user experience with guided setup:
 * - Welcome screen with product overview
 * - Model configuration guide
 * - API key setup
 * - Quick feature tour
 * - Completion celebration
 *
 * The wizard is shown automatically on first run and can be
 * re-opened from the Help menu.
 */

import * as path from "path";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to DeerFlow",
    description: "Your intelligent agent platform for AI-powered workflows",
    icon: "🦌",
  },
  {
    id: "models",
    title: "Configure AI Models",
    description: "Add your first AI model to start using DeerFlow",
    icon: "🤖",
  },
  {
    id: "features",
    title: "Key Features",
    description: "Discover what DeerFlow can do for you",
    icon: "✨",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start creating your first agent workflow",
    icon: "🚀",
  },
];

/**
 * Generate the onboarding wizard HTML
 */
export function getOnboardingHTML(stepIndex: number = 0): string {
  const steps = ONBOARDING_STEPS;
  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const stepIndicators = steps
    .map((step, idx) => {
      const isActive = idx === stepIndex;
      const isCompleted = idx < stepIndex;
      const bg = isActive
        ? "background: linear-gradient(135deg, #6366f1, #4f46e5);"
        : isCompleted
        ? "background: #22c55e;"
        : "background: #333;";
      const color = isActive || isCompleted ? "#fff" : "#666";
      return `<div class="step-dot" style="${bg} color: ${color};">${isCompleted ? "✓" : idx + 1}</div>`;
    })
    .join("");

  const stepContent = getStepContent(stepIndex);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Getting Started</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
      color: #e5e5e5;
      height: 100vh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wizard-container {
      width: 700px;
      max-width: 90vw;
      background: rgba(20, 20, 30, 0.95);
      border: 1px solid #333;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Progress bar */
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #333;
      border-radius: 2px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #4f46e5);
      border-radius: 2px;
      transition: width 0.4s ease;
    }

    /* Step indicators */
    .step-indicators {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .step-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    /* Step content */
    .step-content {
      text-align: center;
      min-height: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .step-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .step-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #818cf8, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .step-description {
      font-size: 1rem;
      color: #888;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    /* Feature cards */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      width: 100%;
      margin: 1rem 0;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid #333;
      border-radius: 10px;
      padding: 1rem;
      text-align: left;
      transition: all 0.2s ease;
    }

    .feature-card:hover {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.05);
    }

    .feature-card-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .feature-card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #e5e5e5;
      margin-bottom: 0.25rem;
    }

    .feature-card-desc {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.4;
    }

    /* Model setup form */
    .model-form {
      width: 100%;
      text-align: left;
      margin: 1rem 0;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #aaa;
      margin-bottom: 0.4rem;
    }

    .form-select, .form-input {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid #444;
      border-radius: 8px;
      color: #e5e5e5;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-select:focus, .form-input:focus {
      border-color: #6366f1;
    }

    .form-select option {
      background: #1a1a2e;
      color: #e5e5e5;
    }

    .form-hint {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.3rem;
    }

    /* Buttons */
    .button-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #333;
    }

    .btn {
      padding: 0.6rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }

    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: transparent;
      color: #888;
      border: 1px solid #444;
    }

    .btn-secondary:hover {
      border-color: #666;
      color: #ccc;
    }

    .btn-skip {
      background: transparent;
      color: #666;
      font-size: 0.85rem;
      border: none;
    }

    .btn-skip:hover {
      color: #888;
    }

    /* Completion animation */
    .completion-animation {
      font-size: 5rem;
      animation: celebrate 1s ease-out;
    }

    @keyframes celebrate {
      0% { transform: scale(0) rotate(-180deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(10deg); }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }

    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      animation: confetti-fall 3s ease-out forwards;
    }

    @keyframes confetti-fall {
      0% { transform: translateY(-100vh) rotate(0); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    /* Shortcut hints */
    .shortcut-hint {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid #444;
      border-radius: 4px;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      color: #888;
      font-family: monospace;
    }

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      margin: 1rem 0;
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.8rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 6px;
    }

    .shortcut-action {
      font-size: 0.85rem;
      color: #aaa;
    }
  </style>
</head>
<body>
  <div class="wizard-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${progress}%"></div>
    </div>

    <div class="step-indicators">
      ${stepIndicators}
    </div>

    <div class="step-content" id="step-content">
      ${stepContent}
    </div>

    <div class="button-row">
      <button class="btn btn-skip" id="btn-skip" onclick="skipWizard()" style="${stepIndex === steps.length - 1 ? "display:none;" : ""}">Skip</button>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" id="btn-back" onclick="prevStep()" style="${stepIndex === 0 ? "display:none;" : ""}">Back</button>
        <button class="btn btn-primary" id="btn-next" onclick="nextStep()">${stepIndex === steps.length - 1 ? "Get Started" : "Next"}</button>
      </div>
    </div>
  </div>

  <script>
    const totalSteps = ${steps.length};
    let currentStep = ${stepIndex};

    function nextStep() {
      if (currentStep < totalSteps - 1) {
        currentStep++;
        updateStep();
      } else {
        completeWizard();
      }
    }

    function prevStep() {
      if (currentStep > 0) {
        currentStep--;
        updateStep();
      }
    }

    function skipWizard() {
      if (window.confirm('Skip the onboarding? You can always access it from Help menu.')) {
        window.electronAPI.onboarding.complete();
      }
    }

    function completeWizard() {
      window.electronAPI.onboarding.complete();
    }

    function updateStep() {
      window.electronAPI.onboarding.navigate(currentStep);
    }

    // Handle model selection
    document.addEventListener('change', function(e) {
      if (e.target.id === 'provider-select') {
        const provider = e.target.value;
        const apiKeyHint = document.getElementById('api-key-hint');
        const modelHint = document.getElementById('model-hint');
        const apiKeyInput = document.getElementById('api-key');

        const hints = {
          openai: { env: 'OPENAI_API_KEY', model: 'gpt-4o' },
          anthropic: { env: 'ANTHROPIC_API_KEY', model: 'claude-3-5-sonnet-20241022' },
          deepseek: { env: 'DEEPSEEK_API_KEY', model: 'deepseek-reasoner' },
          gemini: { env: 'GEMINI_API_KEY', model: 'gemini-2.5-pro' },
          openrouter: { env: 'OPENAI_API_KEY', model: 'google/gemini-2.5-flash-preview' },
          minimax: { env: 'MINIMAX_API_KEY', model: 'MiniMax-Text-01' },
        };

        if (hints[provider]) {
          if (apiKeyHint) apiKeyHint.textContent = 'Will be saved as ' + hints[provider].env + ' in .env file';
          if (modelHint) modelHint.textContent = 'Default: ' + hints[provider].model;
          if (apiKeyInput) apiKeyInput.placeholder = 'sk-...';
        }
      }
    });

    // Handle form submission on model step
    document.addEventListener('click', function(e) {
      if (e.target.id === 'btn-save-model') {
        const provider = document.getElementById('provider-select').value;
        const apiKey = document.getElementById('api-key').value;
        const modelName = document.getElementById('model-name').value;

        if (!provider) {
          alert('Please select a provider');
          return;
        }
        if (!apiKey) {
          alert('Please enter an API key');
          return;
        }

        window.electronAPI.onboarding.saveModel({ provider, apiKey, modelName });
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Get the HTML content for a specific step
 */
function getStepContent(stepIndex: number): string {
  switch (stepIndex) {
    case 0:
      return getWelcomeStep();
    case 1:
      return getModelSetupStep();
    case 2:
      return getFeaturesStep();
    case 3:
      return getCompletionStep();
    default:
      return getWelcomeStep();
  }
}

function getWelcomeStep(): string {
  return `
    <div class="step-icon">🦌</div>
    <h1 class="step-title">Welcome to DeerFlow</h1>
    <p class="step-description">
      Your intelligent agent platform for AI-powered workflows.<br>
      Let's get you set up in just a few steps.
    </p>
    <div class="shortcut-list">
      <div class="shortcut-item">
        <span class="shortcut-action">New Chat</span>
        <span class="shortcut-hint">Ctrl + N</span>
      </div>
      <div class="shortcut-item">
        <span class="shortcut-action">Toggle Sidebar</span>
        <span class="shortcut-hint">Ctrl + B</span>
      </div>
      <div class="shortcut-item">
        <span class="shortcut-action">Settings</span>
        <span class="shortcut-hint">Ctrl + ,</span>
      </div>
    </div>
  `;
}

function getModelSetupStep(): string {
  return `
    <div class="step-icon">🤖</div>
    <h1 class="step-title">Configure Your First AI Model</h1>
    <p class="step-description">Add an AI model to start creating agent workflows</p>
    <div class="model-form">
      <div class="form-group">
        <label class="form-label">AI Provider</label>
        <select class="form-select" id="provider-select">
          <option value="">Select a provider...</option>
          <option value="openai">OpenAI (GPT-4/GPT-4o)</option>
          <option value="anthropic">Anthropic Claude</option>
          <option value="deepseek">DeepSeek V3</option>
          <option value="gemini">Google Gemini</option>
          <option value="openrouter">OpenRouter (Multi-Model)</option>
          <option value="minimax">MiniMax M2.5</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Model Name</label>
        <input type="text" class="form-input" id="model-name" placeholder="e.g., gpt-4o">
        <div class="form-hint" id="model-hint">Select a provider to see default model</div>
      </div>
      <div class="form-group">
        <label class="form-label">API Key</label>
        <input type="password" class="form-input" id="api-key" placeholder="sk-...">
        <div class="form-hint" id="api-key-hint">Select a provider to see required environment variable</div>
      </div>
      <button class="btn btn-primary" id="btn-save-model" style="width: 100%; margin-top: 0.5rem;">Save Model</button>
    </div>
  `;
}

function getFeaturesStep(): string {
  return `
    <div class="step-icon">✨</div>
    <h1 class="step-title">What You Can Do</h1>
    <p class="step-description">Discover the powerful features of DeerFlow</p>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-card-icon">💬</div>
        <div class="feature-card-title">AI Chat</div>
        <div class="feature-card-desc">Converse with AI agents using your configured models</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">🔗</div>
        <div class="feature-card-title">Agent Workflows</div>
        <div class="feature-card-desc">Build complex multi-step agent pipelines</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">📁</div>
        <div class="feature-card-title">File Processing</div>
        <div class="feature-card-desc">Drag and drop files for AI analysis</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">🔧</div>
        <div class="feature-card-title">Skills</div>
        <div class="feature-card-desc">Extend with custom skills and tools</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">⚡</div>
        <div class="feature-card-title">Real-time</div>
        <div class="feature-card-desc">Live service monitoring and notifications</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-icon">🔒</div>
        <div class="feature-card-title">Local First</div>
        <div class="feature-card-desc">Your data stays on your machine</div>
      </div>
    </div>
  `;
}

function getCompletionStep(): string {
  return `
    <div class="completion-animation">🚀</div>
    <h1 class="step-title">You're All Set!</h1>
    <p class="step-description">
      DeerFlow is ready to use.<br>
      Start creating your first agent workflow now.
    </p>
    <div class="shortcut-list" style="margin-top: 1.5rem;">
      <div class="shortcut-item">
        <span class="shortcut-action">Open Settings anytime</span>
        <span class="shortcut-hint">Ctrl + ,</span>
      </div>
      <div class="shortcut-item">
        <span class="shortcut-action">Check service status</span>
        <span class="shortcut-hint">Ctrl + Shift + S</span>
      </div>
      <div class="shortcut-item">
        <span class="shortcut-action">Re-open this wizard</span>
        <span class="shortcut-hint">Help → Getting Started</span>
      </div>
    </div>
  `;
}
