"use client";

import { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from '@/lib/utils';

interface DualPaneLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  defaultSizes?: [number, number];
  className?: string;
}

export default function DualPaneLayout({
  leftPane,
  rightPane,
  defaultSizes = [65, 35],
  className
}: DualPaneLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn("h-full min-h-[calc(100vh-4rem)]", className)}
    >
      <ResizablePanel defaultSize={defaultSizes[0]} minSize={30}>
        <div className="h-full overflow-hidden">
          {leftPane}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultSizes[1]} minSize={25}>
        <div className="h-full overflow-auto">
          {rightPane}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}