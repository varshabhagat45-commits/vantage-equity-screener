import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary: "bg-accent-soft text-accent hover:bg-accent-soft/80",
        outline: "border border-border bg-surface text-fg hover:bg-bg-subtle",
        ghost: "text-muted hover:bg-bg-subtle hover:text-fg",
        danger: "bg-down-soft text-down hover:bg-down/10",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-10 px-3 text-xs",
        lg: "h-11 px-5 text-sm",
        icon: "size-10",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className, variant, size, asChild = false, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
