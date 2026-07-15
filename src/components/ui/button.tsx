import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong shadow-[0_0_0_1px_rgba(124,108,246,0.4),0_4px_12px_rgba(124,108,246,0.25)]",
  secondary:
    "bg-surface-raised text-foreground border border-border hover:bg-surface-hover hover:border-border-strong",
  ghost: "text-muted-strong hover:bg-surface-hover hover:text-foreground",
  danger: "bg-negative-soft text-negative hover:bg-negative/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
