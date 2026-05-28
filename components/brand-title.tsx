type BrandTitleProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function BrandTitle({ className = "", size = "md" }: BrandTitleProps) {
  return (
    <span className={`font-bold tracking-tight ${sizeClasses[size]} ${className}`}>
      <span className="text-foreground">Preventiv</span>
      <span className="text-[#22C55E]">PRO</span>
    </span>
  );
}
