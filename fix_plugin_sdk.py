import re

with open('frontend/src/app/workspace/plugin-sdk/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace JavaScript template
old_js = """  javascript: `// DeerFlow Plugin Template
// Entry point: index.js

class MyPlugin {
  constructor(context) {
    this.context = context;
    this.name = context.manifest!.name;
  }

  async activate() {
    console.log(\\`\\${this.name} activated\\`);

    // Register hooks
    this.context.hooks!.on('before-message', this.onBeforeMessage.bind(this));
    this.context.hooks!.on('after-message', this.onAfterMessage.bind(this));
  }

  async deactivate() {
    console.log(\\`\\${this.name} deactivated\\`);
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

module.exports = MyPlugin;`,"""

new_js = """  javascript: `// DeerFlow Plugin Template
// Entry point: index.js

class MyPlugin {
  constructor(context) {
    this.context = context;
    this.pluginName = context.manifest.name;
  }

  async activate() {
    console.log(this.pluginName + " activated");

    // Register hooks
    this.context.hooks.on("before-message", this.onBeforeMessage.bind(this));
    this.context.hooks.on("after-message", this.onAfterMessage.bind(this));
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

module.exports = MyPlugin;`,"""

# Replace TypeScript template
old_ts = """  typescript: `// DeerFlow Plugin Template (TypeScript)
// Entry point: index.ts

import { PluginContext, Message, HookHandler } from '@deerflow/sdk';

export default class MyPlugin {
  private context: PluginContext;
  private name: string;

  constructor(context: PluginContext) {
    this.context = context;
    this.name = context.manifest!.name;
  }

  async activate(): Promise<void> {
    console.log(\\`\\${this.name} activated\\`);

    this.context.hooks!.on('before-message', this.onBeforeMessage);
    this.context.hooks!.on('after-message', this.onAfterMessage);
  }

  async deactivate(): Promise<void> {
    console.log(\\`\\${this.name} deactivated\\`);"""

new_ts = """  typescript: `// DeerFlow Plugin Template (TypeScript)
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

    this.context.hooks.on("before-message", this.onBeforeMessage);
    this.context.hooks.on("after-message", this.onAfterMessage);
  }

  async deactivate(): Promise<void> {
    console.log(this.pluginName + " deactivated");"""

if old_js in content:
    content = content.replace(old_js, new_js)
    print('JS template replaced')
else:
    print('JS template NOT found')

if old_ts in content:
    content = content.replace(old_ts, new_ts)
    print('TS template replaced')
else:
    print('TS template NOT found')

with open('frontend/src/app/workspace/plugin-sdk/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
