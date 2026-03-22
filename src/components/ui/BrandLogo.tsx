import { useState } from "react";
import clsx from "clsx";

type BrandLogoVariant = "versus" | "depth" | "ranking" | "results" | "catalog";

type BrandLogoProps = {
  src?: string | null;
  alt: string;
  variant?: BrandLogoVariant;
  className?: string;
  imgClassName?: string;
  onError?: () => void;
};

const variantStyles: Record<
  BrandLogoVariant,
  {
    container: string;
    inner: string;
  }
> = {
  versus: {
    container: "w-full h-full min-h-[140px] rounded-2xl",
    inner: "max-w-[72%] max-h-[72%]",
  },
  depth: {
    container: "w-full h-full min-h-[88px] rounded-xl",
    inner: "max-w-[62%] max-h-[62%]",
  },
  ranking: {
    container: "w-full h-full min-h-[56px] rounded-lg",
    inner: "max-w-[58%] max-h-[58%]",
  },
  results: {
    container: "w-full h-full min-h-[96px] rounded-xl",
    inner: "max-w-[64%] max-h-[64%]",
  },
  catalog: {
    container: "w-full h-full min-h-[72px] rounded-xl",
    inner: "max-w-[60%] max-h-[60%]",
  },
};

export default function BrandLogo({
  src,
  alt,
  variant = "catalog",
  className,
  imgClassName,
  onError,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const styles = variantStyles[variant];

  const shouldShowFallback = !src || src.trim() === "" || hasError;
  const initial = alt ? alt.trim().charAt(0).toUpperCase() : "?";

  if (shouldShowFallback) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center overflow-hidden bg-white border border-slate-200",
          styles.container,
          className
        )}
      >
        <span
          className={clsx(
            "font-bold text-slate-300 leading-none select-none",
            variant === "versus" ? "text-6xl" :
            variant === "results" ? "text-4xl" :
            variant === "depth" ? "text-3xl" : "text-xl"
          )}
        >
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center bg-white overflow-hidden",
        styles.container,
        className
      )}
    >
      <img
        src={src as string}
        alt={alt}
        draggable={false}
        onError={() => {
          setHasError(true);
          if (onError) onError();
        }}
        className={clsx(
          "object-contain select-none transition-transform duration-200",
          styles.inner,
          imgClassName
        )}
      />
    </div>
  );
}
