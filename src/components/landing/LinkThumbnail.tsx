import { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

interface LinkThumbnailProps {
  url: string;
  className?: string;
  compact?: boolean;
}

export function LinkThumbnail({ url, className = "", compact = false }: LinkThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace("www.", "");
  } catch {
    hostname = url;
  }

  const thumbnailUrl = `https://image.thum.io/get/width/400/crop/250/${url}`;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border border-border overflow-hidden bg-card hover:border-primary/30 transition-all group ${className}`}
    >
      {!imgError ? (
        <div className={`relative overflow-hidden bg-surface-2 ${compact ? "h-24" : "h-36"}`}>
          {imgLoading && (
            <div className="absolute inset-0 bg-surface-2 animate-pulse" />
          )}
          <img
            src={thumbnailUrl}
            alt={`Preview of ${hostname}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
            onLoad={() => setImgLoading(false)}
          />
        </div>
      ) : (
        <div className={`flex items-center justify-center bg-surface-2 ${compact ? "h-24" : "h-36"}`}>
          <Globe className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      <div className="p-2 flex items-center gap-2 border-t border-border">
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-xs text-foreground font-medium truncate flex-1 group-hover:text-primary transition-colors">
          {hostname}
        </span>
        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
      </div>
    </a>
  );
}
