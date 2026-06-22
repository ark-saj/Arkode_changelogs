import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md9 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/30 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-0",
  {
    variants: {
      variant: {
        // coral = primary single accent (also the default)
        coral:
          "bg-coral text-white hover:bg-coral-deep hover:-translate-y-px",
        default:
          "bg-coral text-white hover:bg-coral-deep hover:-translate-y-px",
        // dark = ink surface
        dark: "bg-ink text-white hover:bg-[#0a2a5c] hover:-translate-y-px",
        // outline / ghost = line-2 border
        outline:
          "border border-line-2 bg-transparent text-ink hover:bg-bone hover:-translate-y-px",
        ghost: "text-ink hover:bg-bone",
        secondary: "bg-bone text-ink hover:bg-bone-2",
        link: "text-coral-deep underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
