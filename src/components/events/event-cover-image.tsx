import Image from "next/image";

function isNextOptimizable(src: string): boolean {
  return (
    src.startsWith("/") ||
    src.includes("supabase.co") ||
    src.includes("supabase.in")
  );
}

type Props = {
  src: string;
  alt: string;
  /** Modo `fill` para containers com `position: relative` e aspect ratio. */
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function EventCoverImage({
  src,
  alt,
  fill = true,
  className = "object-cover",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px",
  priority = false,
}: Props) {
  if (isNextOptimizable(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={fill ? `h-full w-full ${className}` : className}
    />
  );
}
