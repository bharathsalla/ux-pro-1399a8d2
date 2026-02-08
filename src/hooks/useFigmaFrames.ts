import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type FigmaFrame } from "@/types/audit";

interface FigmaResponse {
  fileName: string;
  fileKey: string;
  frames: FigmaFrame[];
  totalFrames: number;
  exportedFrames: number;
}

interface UseFigmaFramesReturn {
  isLoading: boolean;
  error: string | null;
  frames: FigmaFrame[];
  fileName: string | null;
  fetchFrames: (figmaUrl: string) => Promise<FigmaFrame[]>;
  reset: () => void;
}

export function useFigmaFrames(): UseFigmaFramesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<FigmaFrame[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const fetchFrames = async (figmaUrl: string): Promise<FigmaFrame[]> => {
    setIsLoading(true);
    setError(null);
    setFrames([]);
    setFileName(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "fetch-figma-frames",
        {
          body: { figmaUrl },
        }
      );

      if (fnError) {
        const errMsg = fnError.message || "";
        // Handle rate limits from edge function errors
        if (errMsg.includes("429") || errMsg.includes("rate_limit") || errMsg.includes("rate limit")) {
          throw new Error("Figma API rate limit reached. Please wait about 60 seconds and try again.");
        }
        throw new Error(errMsg || "Failed to fetch Figma frames");
      }

      // Check for error in data response
      if (data?.error) {
        if (data.error === "rate_limit" || data.error.includes("rate limit") || data.error.includes("429")) {
          throw new Error("Figma API rate limit reached. Please wait about 60 seconds and try again.");
        }
        throw new Error(data.error);
      }

      const response = data as FigmaResponse;

      // Filter out frames with invalid/null image URLs
      const validFrames = response.frames.filter(
        (f) => f.imageUrl && f.imageUrl.startsWith("http")
      );

      if (validFrames.length === 0) {
        throw new Error("No valid frames could be exported. Try again in about 60 seconds — the Figma API may be rate limiting.");
      }

      setFrames(validFrames);
      setFileName(response.fileName);
      return validFrames;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      console.error("Figma fetch error:", e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFrames([]);
    setFileName(null);
    setError(null);
  };

  return { isLoading, error, frames, fileName, fetchFrames, reset };
}
