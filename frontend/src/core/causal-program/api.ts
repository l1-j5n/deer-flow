import { getBackendBaseURL } from "@/core/config";

// ============================================================
// Types
// ============================================================

export type SynthesisStrategy =
  | "template_based"
  | "constraint_driven"
  | "example_guided"
  | "neuro_symbolic"
  | "llm_assisted"
  | "evolutionary";

export type ProgramLanguage =
  | "python"
  | "r"
  | "julia"
  | "matlab"
  | "sql"
  | "dsl";

export type VerificationMethod =
  | "type_check"
  | "runtime_test"
  | "formal_proof"
  | "counterexample"
  | "property_check"
  | "equivalence";

export type OptimizationTarget =
  | "correctness"
  | "efficiency"
  | "readability"
  | "composability"
  | "robustness"
  | "interpretability";

export type CompositionMode =
  | "sequential"
  | "parallel"
  | "conditional"
  | "iterative"
  | "recursive"
  | "modular";

export type ExecutionEnvironment =
  | "local"
  | "sandbox"
  | "distributed"
  | "gpu_enabled"
  | "streaming"
  | "interactive";

// --- Request Types ---

export interface ProgramSynthesisRequest {
  graph_id: string;
  strategy: SynthesisStrategy;
  language?: ProgramLanguage;
  specification: string;
}

export interface ProgramVerificationRequest {
  graph_id: string;
  method: VerificationMethod;
  program_id: string;
}

export interface ProgramOptimizationRequest {
  graph_id: string;
  target: OptimizationTarget;
  program_id: string;
  iterations?: number;
}

export interface ProgramCompositionRequest {
  graph_id: string;
  mode: CompositionMode;
  component_ids: string[];
}

export interface ProgramExecutionRequest {
  graph_id: string;
  environment?: ExecutionEnvironment;
  program_id: string;
}

export interface ProgramDebugRequest {
  graph_id: string;
  program_id: string;
  error_context?: string;
}

// --- Response Types ---

export interface ProgramCandidate {
  candidate_id: number;
  quality_score: number;
  complexity: number;
  estimated_lines: number;
  imports_header: string;
  strategy_match: number;
  spec_coverage: number;
  execution_time_estimate_ms: number;
  dependencies: number;
  warnings: number;
}

export interface SynthesisResult {
  strategy: SynthesisStrategy;
  strategy_config: Record<string, unknown>;
  language: ProgramLanguage;
  language_config: Record<string, unknown>;
  specification: string;
  n_candidates: number;
  candidates: ProgramCandidate[];
  best_candidate: ProgramCandidate;
  synthesis_confidence: number;
  spec_satisfaction: number;
  synthesis_time_ms: number;
  template_library_size: number;
}

export interface VerificationProperty {
  property: string;
  status: string;
  confidence: number;
  verification_time_ms: number;
  details: string;
}

export interface TestCase {
  test_id: number;
  test_name: string;
  input_size: number;
  passed: boolean;
  execution_time_ms: number;
  assertion_type: string;
}

export interface VerificationResult {
  method: VerificationMethod;
  method_config: Record<string, unknown>;
  program_id: string;
  properties: VerificationProperty[];
  property_count: number;
  pass_count: number;
  warning_count: number;
  fail_count: number;
  test_cases: TestCase[];
  test_count: number;
  test_pass_rate: number;
  overall_verdict: string;
  coverage: number;
  verification_time_ms: number;
}

export interface OptimizationTrajectory {
  iteration: number;
  score: number;
  improvement: number;
  time_ms: number;
  technique_applied: string;
}

export interface OptimizationTransform {
  transform_id: number;
  type: string;
  before_lines: number;
  after_lines: number;
  line_reduction: number;
  performance_gain: number;
}

export interface OptimizationResult {
  target: OptimizationTarget;
  target_config: Record<string, unknown>;
  program_id: string;
  iterations: number;
  initial_score: number;
  final_score: number;
  total_improvement: number;
  improvement_pct: number;
  trajectory: OptimizationTrajectory[];
  transforms: OptimizationTransform[];
  transform_count: number;
  total_time_ms: number;
  convergence_iteration: number;
  recommendation: string;
}

export interface PipelineComponent {
  component_id: string;
  position: number;
  input_type: string;
  output_type: string;
  estimated_runtime_ms: number;
  complexity: string;
  memory_mb: number;
}

export interface CompositionResult {
  mode: CompositionMode;
  mode_config: Record<string, unknown>;
  n_components: number;
  components: PipelineComponent[];
  interfaces: Array<{
    from_component: string;
    to_component: string;
    compatibility: number;
    adapter_required: boolean;
    data_transform: string;
  }>;
  interface_count: number;
  pipeline_complexity: number;
  estimated_total_runtime_ms: number;
  estimated_total_memory_mb: number;
  composition_quality: number;
  maintainability: number;
  data_flow_consistency: number;
}

export interface ExecutionStage {
  stage: number;
  name: string;
  status: string;
  duration_ms: number;
  memory_peak_mb: number;
  records_processed: number;
}

export interface ExecutionResult {
  environment: ExecutionEnvironment;
  environment_config: Record<string, unknown>;
  program_id: string;
  execution_success: boolean;
  stages: ExecutionStage[];
  stage_count: number;
  total_duration_ms: number;
  peak_memory_mb: number;
  total_records: number;
  outputs: Array<{
    output_id: number;
    type: string;
    format: string;
    size_bytes: number;
  }>;
  output_count: number;
  exit_code: number;
  error_message: string | null;
  warnings: number;
  log_lines: number;
}

export interface DebugIssue {
  issue_id: number;
  type: string;
  severity: string;
  line_number: number;
  message: string;
  fixable: boolean;
  suggested_fix: string;
  confidence: number;
}

export interface DebugPatch {
  patch_id: number;
  issue_id: number;
  type: string;
  lines_affected: number;
  confidence: number;
  auto_applicable: boolean;
  risk_level: string;
}

export interface DebugResult {
  program_id: string;
  error_context: string;
  diagnosis: {
    issue_count: number;
    issues: DebugIssue[];
    critical_count: number;
    error_count: number;
    warning_count: number;
    fixable_count: number;
    root_cause: string;
  };
  patches: DebugPatch[];
  patch_count: number;
  auto_fix_available: number;
  estimated_fix_time_ms: number;
  debug_confidence: number;
}

export interface EngineSummary {
  engine: string;
  version: string;
  endpoints: string[];
  enums: Record<string, string[]>;
  features: Record<string, number>;
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// ============================================================
// API Functions
// ============================================================

const API = `${getBackendBaseURL()}/api/graph`;

export async function synthesizeProgram(req: ProgramSynthesisRequest): Promise<{ synthesis: SynthesisResult }> {
  const res = await fetch(`${API}/causal-program/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Synthesis failed: ${res.statusText}`);
  return res.json();
}

export async function verifyProgram(req: ProgramVerificationRequest): Promise<{ verification: VerificationResult }> {
  const res = await fetch(`${API}/causal-program/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Verification failed: ${res.statusText}`);
  return res.json();
}

export async function optimizeProgram(req: ProgramOptimizationRequest): Promise<{ optimization: OptimizationResult }> {
  const res = await fetch(`${API}/causal-program/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Optimization failed: ${res.statusText}`);
  return res.json();
}

export async function composeProgram(req: ProgramCompositionRequest): Promise<{ composition: CompositionResult }> {
  const res = await fetch(`${API}/causal-program/compose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Composition failed: ${res.statusText}`);
  return res.json();
}

export async function executeProgram(req: ProgramExecutionRequest): Promise<{ execution: ExecutionResult }> {
  const res = await fetch(`${API}/causal-program/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Execution failed: ${res.statusText}`);
  return res.json();
}

export async function debugProgram(req: ProgramDebugRequest): Promise<{ debug: DebugResult }> {
  const res = await fetch(`${API}/causal-program/debug`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Debug failed: ${res.statusText}`);
  return res.json();
}

export async function getEngineSummary(): Promise<EngineSummary> {
  const res = await fetch(`${API}/causal-program/summary`);
  if (!res.ok) throw new Error(`Summary failed: ${res.statusText}`);
  return res.json();
}
