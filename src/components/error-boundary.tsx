import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-red-500/20 bg-red-500/5 rounded-lg text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <h3 className="font-semibold text-red-500">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-[250px] truncate">{error.message}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="gap-2">
        <RotateCcw className="w-3 h-3" />
        Try again
      </Button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
