import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/8 text-white",
        success: "border-mint-300/30 bg-mint-300/15 text-mint-300",
        warning: "border-amber-300/30 bg-amber-300/15 text-amber-200",
        danger: "border-coral-400/30 bg-coral-400/15 text-coral-400",
        info: "border-pulse-300/30 bg-pulse-300/15 text-pulse-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

