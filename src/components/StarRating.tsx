import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
  readonly?: boolean;
}

export function StarRating({ rating, onChange, size = "md", readonly = false }: StarRatingProps) {
  const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <Star
            className={`${starSize} ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
