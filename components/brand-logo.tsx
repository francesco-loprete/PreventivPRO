import {
  BRAND_ICON_PNG,
  BRAND_LOGO_PNG,
  BRAND_NAME,
} from "@/lib/branding/constants";

type BrandLogoProps = {
  variant?: "wordmark" | "icon";
  className?: string;
};

export function BrandLogo({
  variant = "wordmark",
  className = "",
}: BrandLogoProps) {
  if (variant === "icon") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BRAND_ICON_PNG}
        alt={BRAND_NAME}
        width={36}
        height={36}
        className={`h-9 w-9 rounded-xl object-contain shrink-0 ${className}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_PNG}
      alt={BRAND_NAME}
      width={160}
      height={36}
      className={`h-8 w-auto max-w-[180px] object-contain object-left ${className}`}
    />
  );
}
