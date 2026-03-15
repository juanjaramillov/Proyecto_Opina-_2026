
import EntityLogo from "./EntityLogo";

type Props = {
  name: string;
  slug?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function EntityBadge({
  name,
  slug,
  size = "md",
  className,
}: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <EntityLogo name={name} slug={slug} size={size} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
      </div>
    </div>
  );
}
