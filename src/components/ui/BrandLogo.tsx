import { useState, useEffect } from "react";
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
    inner: "max-w-[90%] max-h-[75%]", // Protagonist size: allows wide logos to be very wide, square logos to be very tall
  },
  depth: {
    container: "w-full h-full min-h-[88px] rounded-xl",
    inner: "max-w-[85%] max-h-[75%]",
  },
  ranking: {
    container: "w-full h-full min-h-[56px] rounded-lg",
    inner: "max-w-[80%] max-h-[75%]",
  },
  results: {
    container: "w-full h-full min-h-[96px] rounded-xl",
    inner: "max-w-[85%] max-h-[75%]",
  },
  catalog: {
    container: "w-full h-full min-h-[72px] rounded-xl",
    inner: "max-w-[85%] max-h-[75%]",
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

  useEffect(() => {
    setHasError(false);
  }, [src]);

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
        "flex items-center justify-center overflow-hidden",
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
