import { BRAND_GREEN, BRAND_TITLE } from "@/lib/branding/constants";

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
      <span className="text-foreground">{BRAND_TITLE.prefix}</span>
      <span style={{ color: BRAND_GREEN }}>{BRAND_TITLE.suffix}</span>
    </span>
  );
}
