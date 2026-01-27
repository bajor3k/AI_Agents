"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-9 w-9"
          >
            {isFullscreen ? (
              <Minimize className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Maximize className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
