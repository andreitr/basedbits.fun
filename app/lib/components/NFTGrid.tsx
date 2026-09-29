import clsx from "clsx";
import { ReactNode } from "react";

export const nftGridClass =
  "grid justify-items-stretch gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

interface NFTImageProps {
  src?: string;
  alt: string;
}

// Square, lazily loaded token art: the box is sized before the image arrives and offscreen tiles don't download
export const NFTImage = ({ src, alt }: NFTImageProps) => (
  <div className="w-full aspect-square rounded-lg overflow-hidden bg-white/10">
    {src && (
      // eslint-disable-next-line @next/next/no-img-element -- token art comes from arbitrary hosts and data: URIs
      <img
        src={src}
        alt={alt}
        width={175}
        height={175}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    )}
  </div>
);

interface NFTTileProps {
  className: string;
  children: ReactNode;
}

export const NFTTile = ({ className, children }: NFTTileProps) => (
  <div
    className={clsx(
      "flex flex-col p-2 rounded-md items-center justify-start min-w-0",
      className,
    )}
  >
    {children}
  </div>
);

interface NFTGridSkeletonProps {
  count?: number;
  tileClassName: string;
}

// Placeholder grid shaped like the loaded one (image plus one caption line)
export const NFTGridSkeleton = ({
  count = 10,
  tileClassName,
}: NFTGridSkeletonProps) => (
  <div className={clsx(nftGridClass, "animate-pulse")} aria-busy="true">
    {Array.from({ length: count }).map((_, index) => (
      <NFTTile key={index} className={tileClassName}>
        <div className="w-full aspect-square rounded-lg bg-white/10" />
        <div className="mt-2 h-6 w-2/3 rounded bg-white/10" />
      </NFTTile>
    ))}
  </div>
);
