import { useMemo, useState } from "react";

type EntityLogoSize = "sm" | "md" | "lg";

type EntityLogoProps = {
  name: string;
  slug?: string | null;
  size?: EntityLogoSize;
  className?: string;
  rounded?: boolean;
};

const sizeMap: Record<EntityLogoSize, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

const imagePaddingMap: Record<EntityLogoSize, string> = {
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
};

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
  rounded = true,
}: EntityLogoProps) {
  const [hasError, setHasError] = useState(false);

  const logoSrc = useMemo(() => {
    if (!slug) return null;
    return `/logos/entities/${slug}.svg`;
  }, [slug]);

  const initial = useMemo(() => getInitial(name), [name]);

  const shellClass = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden border border-black/5 bg-white",
    rounded ? "rounded-2xl" : "rounded-md",
    sizeMap[size],
    className
  );

  if (!logoSrc || hasError) {
    return (
      <div className={shellClass} aria-label={name} title={name}>
        <span className="select-none text-sm font-semibold text-neutral-700">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div className={shellClass} aria-label={name} title={name}>
      <img
        src={logoSrc}
        alt={name}
        className={cn("h-full w-full object-contain", imagePaddingMap[size])}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
