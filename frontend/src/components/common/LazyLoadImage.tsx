import { useEffect, useRef } from "react";

const LazyImage = ({
  src,
  alt,
  elementClass,
  style,
  observe,
  visibleImages,
  onLoad,
}: {
  src: string;
  alt: string;
  elementClass?: string;
  style: React.CSSProperties;
  observe: (el: Element | null) => void | null | undefined;
  visibleImages: Set<string>;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    observe(imgRef.current);
  }, [observe]);

  return (
    <img
      ref={imgRef}
      src={visibleImages.has(src) ? src : ""}
      data-src={src}
      alt={alt}
      className={elementClass}
      style={style}
      onLoad={onLoad}
    />
  );
};

export default LazyImage;
