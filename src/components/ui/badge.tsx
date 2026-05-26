import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground px-2.5 py-0.5",
        accent:      "bg-[#F0E4D4] text-[#8A5F3B] px-2.5 py-0.5",
        success:     "bg-green-100 text-green-700 px-2.5 py-0.5",
        destructive: "bg-red-100 text-red-700 px-2.5 py-0.5",
        warning:     "bg-amber-100 text-amber-700 px-2.5 py-0.5",
        info:        "bg-blue-100 text-blue-700 px-2.5 py-0.5",
        warm:        "bg-warm-200 text-warm-700 px-2.5 py-0.5",
        outline:     "border border-border text-foreground px-2.5 py-0.5",
        purple:      "bg-purple-100 text-purple-700 px-2.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
