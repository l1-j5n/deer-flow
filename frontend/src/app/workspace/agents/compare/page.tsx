"use client";

// Force dynamic rendering — disable static prerender for this page
export const dynamic = "force-dynamic";

import nextDynamic from "next/dynamic";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the content component with SSR disabled to avoid
// prerender errors with useSearchParams and other client-only hooks.
const AgentCompareContent = nextDynamic(
  () => import("./compare-content").then((m) => m.AgentCompareContent),
  { ssr: false },
);

export default function AgentComparePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <AgentCompareContent />
    </Suspense>
  );
}
