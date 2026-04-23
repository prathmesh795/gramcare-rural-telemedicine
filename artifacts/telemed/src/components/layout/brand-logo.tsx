import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="56" height="56" rx="14" fill="currentColor" />
        <path
          d="M32 14 L32 50"
          stroke="#FAF8F5"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d="M14 32 L50 32"
          stroke="#FAF8F5"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle
          cx="32"
          cy="32"
          r="5"
          fill="currentColor"
          stroke="#FAF8F5"
          strokeWidth={3}
        />
      </svg>
    </div>
  );
}
