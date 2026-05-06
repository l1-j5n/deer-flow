"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  CpuIcon,
  KeyIcon,
  LightbulbIcon,
  MessageSquareIcon,
  PaletteIcon,
  RocketIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useOnboarding, useUpdateOnboarding, useCompleteOnboarding, useProviderApiKeys, useSaveProviderApiKeys } from "@/core/onboarding";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", envVar: "OPENAI_API_KEY", icon: SparklesIcon, color: "bg-green-500" },
  { id: "anthropic", name: "Anthropic", envVar: "ANTHROPIC_API_KEY", icon: LightbulbIcon, color: "bg-orange-500" },
  { id: "deepseek", name: "DeepSeek", envVar: "DEEPSEEK_API_KEY", icon: BotIcon, color: "bg-blue-500" },
  { id: "gemini", name: "Gemini", envVar: "GEMINI_API_KEY", icon: CompassIcon, color: "bg-purple-500" },
  { id: "openrouter", name: "OpenRouter", envVar: "OPENROUTER_API_KEY", icon: CpuIcon, color: "bg-pink-500" },
];

const FEATURES = [
  {
    icon: MessageSquareIcon,
    title: "AI Chat",
    description: "Have intelligent conversations with customizable agents powered by state-of-the-art language models.",
    color: "text-blue-500",
  },
  {
    icon: WrenchIcon,
    title: "Skills & Tools",
    description: "Extend capabilities with built-in and custom skills for web search, data analysis, and more.",
    color: "text-green-500",
  },
  {
    icon: UsersIcon,
    title: "Agent Collaboration",
    description: "Coordinate multiple specialized agents to tackle complex tasks together.",
    color: "text-purple-500",
  },
  {
    icon: ShieldIcon,
    title: "Security",
    description: "AES-256 encryption, rate limiting, and input sanitization keep your data safe.",
    color: "text-red-500",
  },
  {
    icon: CpuIcon,
    title: "Performance Monitoring",
    description: "Real-time health checks and performance metrics to ensure smooth operation.",
    color: "text-yellow-500",
  },
  {
    icon: PaletteIcon,
    title: "Customizable",
    description: "Personalize themes, keyboard shortcuts, and workspace layout to your preference.",
    color: "text-pink-500",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: onboarding, isLoading } = useOnboarding();
  const { data: apiKeysData } = useProviderApiKeys();
  const updateOnboarding = useUpdateOnboarding();
  const completeOnboarding = useCompleteOnboarding();
  const saveApiKeys = useSaveProviderApiKeys();

  const [step, setStep] = useState(onboarding?.currentStep ?? 0);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      updateOnboarding.mutate({ currentStep: step + 1 });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      updateOnboarding.mutate({ currentStep: step - 1 });
    }
  };

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(id)) nxt.delete(id);
      else nxt.add(id);
      return nxt;
    });
    // Update providers in backend - create new set to check enabled status
    const updatedSet = selectedProviders.has(id) ? selectedProviders : new Set([...selectedProviders, id]);
    const updatedProviders = Array.from(updatedSet).map((pid) => ({
      id: pid,
      name: PROVIDERS.find((p) => p.id === pid)?.name ?? pid,
      enabled: true,
    }));
    updateOnboarding.mutate({ providers: updatedProviders });
  };

  const handleApiKeyChange = (providerId: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const handleComplete = async () => {
    setCompleting(true);
    // Save provider API keys
    const keysToSave: Record<string, string> = {};
    for (const providerId of selectedProviders) {
      const key = apiKeys[providerId];
      if (key) {
        keysToSave[providerId] = key;
      }
    }
    if (Object.keys(keysToSave).length > 0) {
      await saveApiKeys.mutateAsync({ keys: keysToSave });
    }
    // Complete onboarding
    await completeOnboarding.mutateAsync();
    // Navigate to chats
    setTimeout(() => {
      router.push("/workspace/chats/new");
    }, 800);
  };

  const canProceed = () => {
    if (step === 1) return selectedProviders.size > 0;
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="text-center">
          <RocketIcon className="size-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        {/* Progress */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(((step + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6">
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
                <RocketIcon className="size-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome to DeerFlow</h2>
                <p className="text-muted-foreground mt-2">
                  Your intelligent agent platform for AI-powered workflows. Let&apos;s get you set up in a few quick steps.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                {FEATURES.slice(0, 4).map((feature) => (
                  <div key={feature.title} className="rounded-lg border p-3">
                    <feature.icon className={`size-5 ${feature.color} mb-2`} />
                    <h4 className="text-sm font-medium">{feature.title}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <KeyIcon className="size-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Configure AI Models</h2>
                <p className="text-muted-foreground mt-2">
                  Select at least one model provider and enter your API key. You can add more later in Settings.
                </p>
              </div>
              <div className="space-y-3">
                {PROVIDERS.map((provider) => {
                  const isSelected = selectedProviders.has(provider.id);
                  return (
                    <div
                      key={provider.id}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
                      }`}
                      onClick={() => toggleProvider(provider.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-full ${provider.color}`}>
                          <provider.icon className="size-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.name}</span>
                            {isSelected && (
                              <Badge variant="default" className="text-[10px]">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">{provider.envVar}</p>
                        </div>
                        <div
                          className={`size-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <CheckCircle2Icon className="size-3 text-white" />}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-3">
                          <Input
                            type="password"
                            placeholder={`Enter ${provider.name} API key`}
                            value={apiKeys[provider.id] || ""}
                            onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <CompassIcon className="size-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Explore Features</h2>
                <p className="text-muted-foreground mt-2">
                  DeerFlow comes with powerful features to supercharge your AI workflows.
                </p>
              </div>
              <div className="grid gap-3">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="mt-0.5">
                      <feature.icon className={`size-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2Icon className="size-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">You&apos;re All Set!</h2>
                <p className="text-muted-foreground mt-2">
                  DeerFlow is ready to use. Start a new chat or explore the workspace to discover more.
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-left space-y-2">
                <h4 className="text-sm font-medium">Quick Tips</h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="size-3 text-primary" />
                    Press Ctrl+N to start a new chat anytime
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="size-3 text-primary" />
                    Use Ctrl+B to toggle the sidebar
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="size-3 text-primary" />
                    Visit Settings to customize themes and shortcuts
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRightIcon className="size-3 text-primary" />
                    Check the Dashboard for system health and stats
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
            <ChevronLeftIcon className="size-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {step < totalSteps - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRightIcon className="size-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={completing}>
                {completing ? (
                  <>
                    <SettingsIcon className="size-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <RocketIcon className="size-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}