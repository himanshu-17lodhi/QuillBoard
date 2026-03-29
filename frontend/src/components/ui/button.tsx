import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "icon";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-ink-800 text-white shadow-sm hover:bg-ink-700 focus-visible:outline-ink-500",
  ghost: "bg-transparent text-ink-900 hover:bg-white/70 focus-visible:outline-ink-400",
  outline:
    "border border-ink-200 bg-white/80 text-ink-900 hover:border-ink-300 hover:bg-white focus-visible:outline-ink-400"
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 rounded-2xl px-3 text-sm",
  md: "h-10 rounded-2xl px-4 text-sm",
  icon: "h-10 w-10 rounded-2xl p-0"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});

