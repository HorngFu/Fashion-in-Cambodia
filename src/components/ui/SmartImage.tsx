import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";

// next/image with a fixed aspect ratio and a soft background while loading,
// so the layout does not jump on slow connections. `alt` is required.
export function SmartImage({
  alt,
  aspect = "4/3",
  className,
  sizes = "(min-width: 768px) 33vw, 100vw",
  ...props
}: Omit<ImageProps, "fill"> & { alt: string; aspect?: string }) {
  return (
    <div
      className={cn(
        "bg-surface-muted relative overflow-hidden rounded-[var(--radius-card)]",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      <Image
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        loading="lazy"
        {...props}
      />
    </div>
  );
}
