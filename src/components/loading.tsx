import { Loader2 } from "lucide-react";

// Loading component for Suspense fallback
const LoadingComponent = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
    </div>
  </div>
);

export default LoadingComponent;
