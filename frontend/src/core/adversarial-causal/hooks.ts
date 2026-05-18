// =============================================================================
// v1.237 - Graph Adversarial Causal Robustness Engine - React Hooks
// =============================================================================

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  generateAdversarialAttack,
  applyDefense,
  assessRobustness,
  certifyRobustness,
  hardenModel,
  auditAdversarialVulnerabilities,
  getAdversarialCausalOverview,
  type AdversarialAttackRequest,
  type DefenseRequest,
  type RobustnessAssessmentRequest,
  type CertificationRequest,
  type HardeningRequest,
  type AuditRequest,
} from './api';

// Hook for generating adversarial attacks
export function useAdversarialAttack() {
  return useMutation({
    mutationFn: (request: AdversarialAttackRequest) => generateAdversarialAttack(request),
  });
}

// Hook for applying defense mechanisms
export function useAdversarialDefense() {
  return useMutation({
    mutationFn: (request: DefenseRequest) => applyDefense(request),
  });
}

// Hook for assessing robustness metrics
export function useRobustnessAssessment() {
  return useMutation({
    mutationFn: (request: RobustnessAssessmentRequest) => assessRobustness(request),
  });
}

// Hook for certifying robustness bounds
export function useRobustnessCertification() {
  return useMutation({
    mutationFn: (request: CertificationRequest) => certifyRobustness(request),
  });
}

// Hook for hardening causal models
export function useModelHardening() {
  return useMutation({
    mutationFn: (request: HardeningRequest) => hardenModel(request),
  });
}

// Hook for auditing adversarial vulnerabilities
export function useAdversarialAudit() {
  return useMutation({
    mutationFn: (request: AuditRequest) => auditAdversarialVulnerabilities(request),
  });
}

// Hook for getting engine overview
export function useAdversarialCausalOverview() {
  return useQuery({
    queryKey: ['adversarial-causal', 'overview'],
    queryFn: getAdversarialCausalOverview,
  });
}