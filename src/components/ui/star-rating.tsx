import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showCount = false,
  count,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <div key={i} className="relative">
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-warm-200 text-warm-300"
                )}
              />
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${(rating % 1) * 100}%` }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "fill-amber-400 text-amber-400"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="ml-0.5">({count})</span>
          )}
        </span>
      )}
    </div>
  );
}

// Interactive star rating for forms
interface InteractiveStarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InteractiveStarRating({
  value,
  onChange,
  size = "md",
  className,
}: InteractiveStarRatingProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`Rate ${i + 1} stars`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors duration-150",
              i < value
                ? "fill-amber-400 text-amber-400"
                : "fill-warm-200 text-warm-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
