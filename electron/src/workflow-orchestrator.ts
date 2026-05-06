/**
 * DeerFlow Electron - Agent Workflow Orchestrator
 *
 * Orchestrates agent workflows as DAGs (Directed Acyclic Graphs):
 * - Define workflow nodes: llm, tool, condition, parallel, loop, delay
 * - Execute workflows with state tracking
 * - Variable substitution and context passing
 * - Pause/resume long-running workflows
 * - Error handling with retry and fallback
 *
 * Integrates with MCPManager for tool calls and AgentSessionManager for state.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type WorkflowNodeType =
  | "llm"           // LLM inference call
  | "tool"          // MCP tool execution
  | "condition"     // If/else branch
  | "parallel"      // Parallel execution of sub-nodes
  | "loop"          // For/while iteration
  | "delay"         // Wait N milliseconds
  | "input"         // User input request
  | "output"        // Emit result/output
  | "merge";        // Merge multiple branches

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  config: Record<string, any>;
  next?: string | string[];      // Next node(s) by ID
  onError?: string;              // Error handler node
  dependsOn?: string[];          // DAG dependencies
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  entryNode: string;
  variables?: Record<string, any>; // Default variables
  version: number;
  createdAt: string;
}

export type WorkflowStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  variables: Record<string, any>;
  nodeResults: Map<string, any>;
  currentNodeId?: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  logs: WorkflowLogEntry[];
}

export interface WorkflowLogEntry {
  timestamp: string;
  nodeId: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: any;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: WorkflowDefinition;
  tags?: string[];
}

// ============================================================
// Workflow Orchestrator
// ============================================================

export class WorkflowOrchestrator extends EventEmitter {
  private projectRoot: string;
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();
  private workflowsDir: string;
  private executionsDir: string;
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.workflowsDir = path.join(projectRoot, ".deerflow", "workflows");
    this.executionsDir = path.join(projectRoot, ".deerflow", "workflow-executions");
    this.ensureDirectories();
    this.loadBuiltInTemplates();
    this.loadWorkflows();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.workflowsDir)) {
      fs.mkdirSync(this.workflowsDir, { recursive: true });
    }
    if (!fs.existsSync(this.executionsDir)) {
      fs.mkdirSync(this.executionsDir, { recursive: true });
    }
  }

  // ============================================================
  // Built-in Templates
  // ============================================================

  private loadBuiltInTemplates(): void {
    const templates: WorkflowTemplate[] = [
      {
        id: "template-research",
        name: "Deep Research",
        description: "Multi-step research: search → analyze → synthesize",
        category: "research",
        tags: ["research", "analysis"],
        definition: {
          id: "wf-research",
          name: "Deep Research",
          version: 1,
          createdAt: new Date().toISOString(),
          entryNode: "input-topic",
          nodes: [
            {
              id: "input-topic",
              type: "input",
              name: "Get Research Topic",
              config: { prompt: "What topic would you like to research?" },
              next: "search",
            },
            {
              id: "search",
              type: "tool",
              name: "Search Information",
              config: { tool: "web_search", args: { query: "{{topic}}" } },
              next: "analyze",
            },
            {
              id: "analyze",
              type: "llm",
              name: "Analyze Results",
              config: {
                prompt: "Analyze the following search results and extract key insights:\n{{search.results}}",
                model: "default",
              },
              next: "synthesize",
            },
            {
              id: "synthesize",
              type: "llm",
              name: "Synthesize Report",
              config: {
                prompt: "Create a comprehensive report from these insights:\n{{analyze.output}}",
                model: "default",
                outputVar: "report",
              },
              next: "output",
            },
            {
              id: "output",
              type: "output",
              name: "Output Report",
              config: { var: "report" },
            },
          ],
        },
      },
      {
        id: "template-parallel-tasks",
        name: "Parallel Task Execution",
        description: "Execute multiple independent tasks in parallel",
        category: "automation",
        tags: ["parallel", "automation"],
        definition: {
          id: "wf-parallel",
          name: "Parallel Tasks",
          version: 1,
          createdAt: new Date().toISOString(),
          entryNode: "parallel",
          nodes: [
            {
              id: "parallel",
              type: "parallel",
              name: "Run Tasks",
              config: {
                branches: [
                  { id: "task-a", type: "tool", config: { tool: "fetch", args: { url: "{{urlA}}" } } },
                  { id: "task-b", type: "tool", config: { tool: "fetch", args: { url: "{{urlB}}" } } },
                ],
              },
              next: "merge",
            },
            {
              id: "merge",
              type: "merge",
              name: "Combine Results",
              config: { vars: ["task-a.result", "task-b.result"] },
              next: "output",
            },
            {
              id: "output",
              type: "output",
              name: "Output Combined",
              config: { var: "merge.output" },
            },
          ],
        },
      },
      {
        id: "template-conditional",
        name: "Conditional Routing",
        description: "Route based on LLM classification result",
        category: "routing",
        tags: ["conditional", "routing"],
        definition: {
          id: "wf-conditional",
          name: "Conditional Route",
          version: 1,
          createdAt: new Date().toISOString(),
          entryNode: "classify",
          nodes: [
            {
              id: "classify",
              type: "llm",
              name: "Classify Input",
              config: {
                prompt: "Classify the following as 'question', 'command', or 'chat': {{input}}",
                outputVar: "category",
              },
              next: "condition",
            },
            {
              id: "condition",
              type: "condition",
              name: "Route by Category",
              config: {
                variable: "category",
                branches: {
                  question: "handle-question",
                  command: "handle-command",
                },
                default: "handle-chat",
              },
            },
            {
              id: "handle-question",
              type: "llm",
              name: "Answer Question",
              config: { prompt: "Answer this question: {{input}}" },
              next: "output",
            },
            {
              id: "handle-command",
              type: "tool",
              name: "Execute Command",
              config: { tool: "shell", args: { cmd: "{{input}}" } },
              next: "output",
            },
            {
              id: "handle-chat",
              type: "llm",
              name: "Chat Response",
              config: { prompt: "Respond naturally: {{input}}" },
              next: "output",
            },
            {
              id: "output",
              type: "output",
              name: "Output Result",
              config: { var: "result" },
            },
          ],
        },
      },
    ];

    for (const t of templates) {
      this.templates.set(t.id, t);
    }
  }

  // ============================================================
  // Workflow CRUD
  // ============================================================

  createWorkflow(definition: Omit<WorkflowDefinition, "id" | "createdAt" | "version">): WorkflowDefinition {
    const id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const workflow: WorkflowDefinition = {
      ...definition,
      id,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    this.workflows.set(id, workflow);
    this.saveWorkflow(id);

    this.emit("workflow-created", workflow);
    return workflow;
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id);
  }

  updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): { success: boolean; error?: string } {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      return { success: false, error: `Workflow "${id}" not found` };
    }

    Object.assign(workflow, updates, { version: workflow.version + 1 });
    this.saveWorkflow(id);

    this.emit("workflow-updated", workflow);
    return { success: true };
  }

  deleteWorkflow(id: string): { success: boolean; error?: string } {
    if (!this.workflows.has(id)) {
      return { success: false, error: `Workflow "${id}" not found` };
    }

    this.workflows.delete(id);

    const filePath = path.join(this.workflowsDir, `${id}.json`);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`[WorkflowOrchestrator] Failed to delete workflow file:`, err);
    }

    this.emit("workflow-deleted", id);
    return { success: true };
  }

  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    );
  }

  private saveWorkflow(id: string): void {
    const workflow = this.workflows.get(id);
    if (!workflow) return;

    try {
      const filePath = path.join(this.workflowsDir, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2), "utf-8");
    } catch (err) {
      console.warn(`[WorkflowOrchestrator] Failed to save workflow ${id}:`, err);
    }
  }

  private loadWorkflows(): void {
    try {
      if (!fs.existsSync(this.workflowsDir)) return;
      const files = fs.readdirSync(this.workflowsDir).filter((f) => f.endsWith(".json"));

      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(this.workflowsDir, file), "utf-8");
          const workflow: WorkflowDefinition = JSON.parse(content);
          this.workflows.set(workflow.id, workflow);
        } catch (err) {
          console.warn(`[WorkflowOrchestrator] Failed to load workflow ${file}:`, err);
        }
      }
    } catch (err) {
      console.warn("[WorkflowOrchestrator] Failed to load workflows:", err);
    }
  }

  // ============================================================
  // Template Management
  // ============================================================

  getTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }

  createFromTemplate(templateId: string, overrides?: Partial<WorkflowDefinition>): WorkflowDefinition | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    return this.createWorkflow({
      ...template.definition,
      ...overrides,
      name: overrides?.name || `${template.name} (Copy)`,
    });
  }

  // ============================================================
  // Workflow Execution Engine
  // ============================================================

  async execute(
    workflowId: string,
    initialVars: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow "${workflowId}" not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: "running",
      variables: { ...workflow.variables, ...initialVars },
      nodeResults: new Map(),
      currentNodeId: workflow.entryNode,
      startedAt: new Date().toISOString(),
      logs: [],
    };

    this.executions.set(executionId, execution);
    this.emit("execution-started", executionId, workflowId);

    try {
      await this.runNode(execution, workflow.entryNode, workflow);
      execution.status = "completed";
      execution.completedAt = new Date().toISOString();
      this.emit("execution-completed", executionId);
    } catch (err: any) {
      execution.status = "failed";
      execution.error = err.message;
      execution.completedAt = new Date().toISOString();
      this.log(execution, workflow.entryNode, "error", err.message);
      this.emit("execution-failed", executionId, err.message);
    }

    this.saveExecution(executionId);
    return execution;
  }

  private async runNode(
    execution: WorkflowExecution,
    nodeId: string,
    workflow: WorkflowDefinition
  ): Promise<any> {
    if (execution.status === "cancelled" || execution.status === "paused") {
      return;
    }

    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found in workflow`);
    }

    execution.currentNodeId = nodeId;
    this.log(execution, nodeId, "info", `Executing ${node.type} node: ${node.name}`);

    let result: any;

    try {
      switch (node.type) {
        case "llm":
          result = await this.executeLLMNode(node, execution);
          break;
        case "tool":
          result = await this.executeToolNode(node, execution);
          break;
        case "condition":
          result = await this.executeConditionNode(node, execution, workflow);
          break;
        case "parallel":
          result = await this.executeParallelNode(node, execution, workflow);
          break;
        case "loop":
          result = await this.executeLoopNode(node, execution, workflow);
          break;
        case "delay":
          result = await this.executeDelayNode(node);
          break;
        case "input":
          result = await this.executeInputNode(node, execution);
          break;
        case "output":
          result = this.executeOutputNode(node, execution);
          break;
        case "merge":
          result = this.executeMergeNode(node, execution);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    } catch (err: any) {
      this.log(execution, nodeId, "error", err.message);

      if (node.onError) {
        this.log(execution, nodeId, "warn", `Routing to error handler: ${node.onError}`);
        return await this.runNode(execution, node.onError, workflow);
      }

      throw err;
    }

    execution.nodeResults.set(nodeId, result);

    // Store in variable if configured
    if (node.config.outputVar) {
      execution.variables[node.config.outputVar] = result;
    }

    // Proceed to next node(s)
    if (node.next) {
      const nextIds = Array.isArray(node.next) ? node.next : [node.next];
      for (const nextId of nextIds) {
        await this.runNode(execution, nextId, workflow);
      }
    }

    return result;
  }

  // ============================================================
  // Node Executors
  // ============================================================

  private async executeLLMNode(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const prompt = this.interpolate(node.config.prompt, execution.variables);
    // Placeholder: In production, this would call the backend LangGraph API
    return { output: `[LLM Response to: ${prompt.substring(0, 100)}...]`, prompt };
  }

  private async executeToolNode(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const toolName = node.config.tool;
    const args = this.interpolateObject(node.config.args || {}, execution.variables);
    // Placeholder: In production, this would call mcpManager.executeTool()
    return { tool: toolName, args, result: `[Tool ${toolName} executed]` };
  }

  private async executeConditionNode(
    node: WorkflowNode,
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<any> {
    const varName = node.config.variable;
    const value = execution.variables[varName];
    const branches: Record<string, string> = node.config.branches || {};
    const nextId = branches[String(value)] || node.config.default;

    if (nextId) {
      await this.runNode(execution, nextId, workflow);
    }

    return { value, branch: nextId };
  }

  private async executeParallelNode(
    node: WorkflowNode,
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<any> {
    const branches = node.config.branches || [];
    const results = await Promise.allSettled(
      branches.map((branch: any) => this.runBranch(branch, execution, workflow))
    );

    return results.map((r) => (r.status === "fulfilled" ? r.value : { error: r.reason }));
  }

  private async runBranch(
    branch: any,
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<any> {
    // Create a temporary node for the branch
    const tempNode: WorkflowNode = {
      id: branch.id,
      type: branch.type,
      name: branch.name || branch.id,
      config: branch.config,
    };

    let result: any;
    switch (tempNode.type) {
      case "llm":
        result = await this.executeLLMNode(tempNode, execution);
        break;
      case "tool":
        result = await this.executeToolNode(tempNode, execution);
        break;
      default:
        result = await this.runNode(execution, branch.id, workflow);
    }

    execution.nodeResults.set(branch.id, result);
    if (branch.config?.outputVar) {
      execution.variables[branch.config.outputVar] = result;
    }

    return result;
  }

  private async executeLoopNode(
    node: WorkflowNode,
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<any> {
    const iterations = node.config.iterations || 1;
    const loopBody = node.config.body;
    const results = [];

    for (let i = 0; i < iterations; i++) {
      execution.variables[`${node.id}_index`] = i;
      if (loopBody) {
        const result = await this.runNode(execution, loopBody, workflow);
        results.push(result);
      }
    }

    return results;
  }

  private async executeDelayNode(node: WorkflowNode): Promise<void> {
    const ms = node.config.ms || 1000;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async executeInputNode(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const prompt = this.interpolate(node.config.prompt, execution.variables);
    // Placeholder: In production, this would prompt the user via IPC
    execution.status = "paused";
    this.emit("execution-paused-for-input", execution.id, { prompt, nodeId: node.id });
    return { prompt, status: "awaiting_input" };
  }

  private executeOutputNode(node: WorkflowNode, execution: WorkflowExecution): any {
    const varName = node.config.var;
    const value = varName ? execution.variables[varName] : execution.nodeResults;
    this.emit("execution-output", execution.id, value);
    return value;
  }

  private executeMergeNode(node: WorkflowNode, execution: WorkflowExecution): any {
    const vars = node.config.vars || [];
    const merged: Record<string, any> = {};
    for (const v of vars) {
      merged[v] = execution.variables[v];
    }
    execution.variables[`${node.id}_output`] = merged;
    return merged;
  }

  // ============================================================
  // Execution Control
  // ============================================================

  pauseExecution(id: string): { success: boolean; error?: string } {
    const exec = this.executions.get(id);
    if (!exec) return { success: false, error: `Execution "${id}" not found` };
    if (exec.status !== "running") return { success: false, error: "Execution is not running" };

    exec.status = "paused";
    this.emit("execution-paused", id);
    return { success: true };
  }

  resumeExecution(id: string): { success: boolean; error?: string } {
    const exec = this.executions.get(id);
    if (!exec) return { success: false, error: `Execution "${id}" not found` };
    if (exec.status !== "paused") return { success: false, error: "Execution is not paused" };

    exec.status = "running";
    this.emit("execution-resumed", id);
    return { success: true };
  }

  cancelExecution(id: string): { success: boolean; error?: string } {
    const exec = this.executions.get(id);
    if (!exec) return { success: false, error: `Execution "${id}" not found` };
    if (exec.status !== "running" && exec.status !== "paused") {
      return { success: false, error: "Execution cannot be cancelled" };
    }

    exec.status = "cancelled";
    exec.completedAt = new Date().toISOString();
    this.emit("execution-cancelled", id);
    return { success: true };
  }

  provideInput(executionId: string, nodeId: string, value: any): { success: boolean; error?: string } {
    const exec = this.executions.get(executionId);
    if (!exec) return { success: false, error: `Execution "${executionId}" not found` };

    exec.variables[nodeId] = value;
    exec.status = "running";

    // Resume execution from the paused node
    const workflow = this.workflows.get(exec.workflowId);
    if (workflow) {
      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (node?.next) {
        const nextIds = Array.isArray(node.next) ? node.next : [node.next];
        for (const nextId of nextIds) {
          this.runNode(exec, nextId, workflow).catch((err) => {
            exec.status = "failed";
            exec.error = err.message;
            this.emit("execution-failed", executionId, err.message);
          });
        }
      }
    }

    return { success: true };
  }

  // ============================================================
  // Variable Interpolation
  // ============================================================

  private interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, path) => {
      const parts = path.split(".");
      let value: any = variables;
      for (const part of parts) {
        value = value?.[part];
      }
      return value !== undefined ? String(value) : `{{${path}}}`;
    });
  }

  private interpolateObject(obj: Record<string, any>, variables: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = this.interpolate(value, variables);
      } else if (typeof value === "object" && value !== null) {
        result[key] = this.interpolateObject(value, variables);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // ============================================================
  // Logging & Persistence
  // ============================================================

  private log(
    execution: WorkflowExecution,
    nodeId: string,
    level: WorkflowLogEntry["level"],
    message: string,
    data?: any
  ): void {
    execution.logs.push({
      timestamp: new Date().toISOString(),
      nodeId,
      level,
      message,
      data,
    });
  }

  private saveExecution(id: string): void {
    const exec = this.executions.get(id);
    if (!exec) return;

    try {
      const filePath = path.join(this.executionsDir, `${id}.json`);
      const serialized = {
        ...exec,
        nodeResults: Object.fromEntries(exec.nodeResults),
      };
      fs.writeFileSync(filePath, JSON.stringify(serialized, null, 2), "utf-8");
    } catch (err) {
      console.warn(`[WorkflowOrchestrator] Failed to save execution ${id}:`, err);
    }
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  listExecutions(workflowId?: string): WorkflowExecution[] {
    let results = Array.from(this.executions.values());
    if (workflowId) {
      results = results.filter((e) => e.workflowId === workflowId);
    }
    return results.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  // ============================================================
  // Validation
  // ============================================================

  validateWorkflow(definition: WorkflowDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!definition.entryNode) {
      errors.push("Workflow must have an entryNode");
    }

    const nodeIds = new Set(definition.nodes.map((n) => n.id));

    if (!nodeIds.has(definition.entryNode)) {
      errors.push(`Entry node "${definition.entryNode}" not found in nodes`);
    }

    for (const node of definition.nodes) {
      if (node.next) {
        const nextIds = Array.isArray(node.next) ? node.next : [node.next];
        for (const nextId of nextIds) {
          if (!nodeIds.has(nextId)) {
            errors.push(`Node "${node.id}" references unknown next node "${nextId}"`);
          }
        }
      }

      if (node.onError && !nodeIds.has(node.onError)) {
        errors.push(`Node "${node.id}" references unknown error handler "${node.onError}"`);
      }
    }

    // Check for cycles (simple DFS)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = definition.nodes.find((n) => n.id === nodeId);
      if (node?.next) {
        const nextIds = Array.isArray(node.next) ? node.next : [node.next];
        for (const nextId of nextIds) {
          if (!visited.has(nextId) && hasCycle(nextId)) return true;
          if (recursionStack.has(nextId)) return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    if (hasCycle(definition.entryNode)) {
      errors.push("Workflow contains a cycle (not a DAG)");
    }

    return { valid: errors.length === 0, errors };
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    for (const timer of this.saveTimers.values()) {
      clearTimeout(timer);
    }
    this.saveTimers.clear();
    this.removeAllListeners();
  }
}
