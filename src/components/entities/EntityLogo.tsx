import { useMemo, useState, useEffect } from "react";
import BrandLogo from "../ui/BrandLogo";type EntityLogoSize = "sm" | "md" | "lg";

type EntityLogoProps = {
  name: string;
  slug?: string | null;
  size?: EntityLogoSize;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
  variant?: "versus" | "depth" | "ranking" | "results" | "catalog";
};

const sizeMap: Record<EntityLogoSize, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-24 w-24",
};

// Removed imagePaddingMap

function getInitial(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function EntityLogo({
  name,
  slug,
  size = "md",
  className,
  imgClassName,
  rounded = true,
  variant,
}: EntityLogoProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const logoSrcs = useMemo(() => {
    if (!slug) return [];
    return [
      `/logos/entities/${slug}.svg`,
      `/logos/entities/${slug}.png`,
      `/logos/entities/${slug}.jpg`,
      `/logos/entities/${slug}.jpeg`,
      `/logos/entities/${slug}.webp`
    ];
  }, [slug]);

  const initial = useMemo(() => getInitial(name), [name]);

  useEffect(() => {
    // Reset state if slug changes
    setCurrentSrcIndex(0);
    setHasError(false);
  }, [slug]);

  const shellClass = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden border border-black/5 bg-white",
    rounded ? "rounded-2xl" : "rounded-md",
    sizeMap[size],
    className
  );

  if (!logoSrcs.length || hasError || currentSrcIndex >= logoSrcs.length) {
    return (
      <div className={shellClass} aria-label={name} title={name}>
        <span className="select-none text-sm font-semibold text-neutral-700">
          {initial}
        </span>
      </div>
    );
  }

  // Use mapped variant if not provided
  let defaultVariant: "versus" | "depth" | "ranking" | "results" | "catalog" = "catalog";
  if (size === "lg") defaultVariant = "versus";
  else if (size === "md") defaultVariant = "depth";
  else if (size === "sm") defaultVariant = "ranking";

  return (
    <BrandLogo
      src={logoSrcs[currentSrcIndex]}
      alt={name}
      variant={variant || defaultVariant}
      className={className}
      imgClassName={imgClassName}
      onError={() => setCurrentSrcIndex((prev) => prev + 1)}
    />
  );
}
