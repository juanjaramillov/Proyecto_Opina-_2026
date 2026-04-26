import { useMemo, useState, useEffect } from "react";
import BrandLogo from "../ui/BrandLogo";type EntityLogoSize = "sm" | "md" | "lg";

type EntityLogoProps = {
  name: string;
  src?: string | null;
  slug?: string | null;
  domain?: string | null;
  size?: EntityLogoSize;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
  variant?: "versus" | "depth" | "ranking" | "results" | "catalog";
  fallbackClassName?: string;
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
  src,
  slug,
  domain,
  size = "md",
  className,
  imgClassName,
  rounded = true,
  variant,
  fallbackClassName,
}: EntityLogoProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const logoSrcs = useMemo(() => {
    const srcs: string[] = [];
    
    // 0. Prioridad absoluta: Imagen subida al Panel Admin (Supabase Storage)
    if (src) {
        srcs.push(src);
    }
    
    if (slug) {
      // 1. Nueva carpeta productiva (Solo Strong)
      srcs.push(`/logos/entities/${slug}.svg`);
      srcs.push(`/logos/entities/${slug}.png`);
      srcs.push(`/logos/entities/${slug}.jpg`);
      srcs.push(`/logos/entities/${slug}.jpeg`);
      srcs.push(`/logos/entities/${slug}.webp`);

      // 2. Fallback al catálogo legacy (backup)
      srcs.push(`/logos/entities_legacy/${slug}.svg`);
      srcs.push(`/logos/entities_legacy/${slug}.png`);
      srcs.push(`/logos/entities_legacy/${slug}.jpg`);
      srcs.push(`/logos/entities_legacy/${slug}.jpeg`);
      srcs.push(`/logos/entities_legacy/${slug}.webp`);
    }
    // 3. Fallback remoto actual (Brandfetch)
    if (domain) {
      srcs.push(`https://asset.brandfetch.io/${domain}/logo`);
      srcs.push(`https://asset.brandfetch.io/${domain}/icon`);
    }
    return srcs;
  }, [src, slug, domain]);

  const initial = useMemo(() => getInitial(name), [name]);

  useEffect(() => {
    // Reset state if src, slug or domain changes
    setCurrentSrcIndex(0);
    setHasError(false);
  }, [src, slug, domain]);

  const shellClass = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden border border-black/5 bg-white",
    rounded ? "rounded-2xl" : "rounded-md",
    sizeMap[size],
    className
  );

  if (!logoSrcs.length || hasError || currentSrcIndex >= logoSrcs.length) {
    return (
      <div className={fallbackClassName || shellClass} aria-label={name} title={name}>
        <span className={fallbackClassName ? "" : "select-none text-sm font-semibold text-slate-700"}>
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
