import { useMutation, useQuery } from "@tanstack/react-query";
import {
  synthesizeProgram,
  verifyProgram,
  optimizeProgram,
  composeProgram,
  executeProgram,
  debugProgram,
  getEngineSummary,
  type ProgramSynthesisRequest,
  type ProgramVerificationRequest,
  type ProgramOptimizationRequest,
  type ProgramCompositionRequest,
  type ProgramExecutionRequest,
  type ProgramDebugRequest,
} from "./api";

export const useSynthesizeProgram = () =>
  useMutation({ mutationFn: synthesizeProgram });

export const useVerifyProgram = () =>
  useMutation({ mutationFn: verifyProgram });

export const useOptimizeProgram = () =>
  useMutation({ mutationFn: optimizeProgram });

export const useComposeProgram = () =>
  useMutation({ mutationFn: composeProgram });

export const useExecuteProgram = () =>
  useMutation({ mutationFn: executeProgram });

export const useDebugProgram = () =>
  useMutation({ mutationFn: debugProgram });

export const useCausalProgramSummary = () =>
  useQuery({
    queryKey: ["causal-program-summary"],
    queryFn: getEngineSummary,
    staleTime: 60_000,
  });
