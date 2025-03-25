import { useEffect, useRef, useState } from "react";
import "./style/LazyLoadImage.css";

const LazyImage = ({
  src,
  alt,
  elementClass,
  style,
  observe,
  visibleImages,
  onLoad,
  onError,
}: {
  src: string;
  alt: string;
  elementClass?: string;
  style: React.CSSProperties;
  observe: (el: Element | null) => void | null | undefined;
  visibleImages: Set<string>;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    observe(imgRef.current);
  }, [observe]);

  const localOnLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (visibleImages.has(src)) {
      /**
       * Only handle load event when we have our actual src
       * Do not handle load event produced by an empty string as src
       */
      setLoaded(true);
      if (onLoad) onLoad(event);
    }
  };

  const localOnError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (visibleImages.has(src)) {
      /**
       * Only handle error event when we have our actual src
       * Do not handle error event produced by an empty string as src
       */
      if (onError) {
        onError(event);
      }
    }
  };

  return (
    <img
      ref={imgRef}
      src={visibleImages.has(src) ? src : ""}
      data-src={src}
      alt={alt}
      className={`${elementClass} lazy-img ${loaded ? "loaded" : ""}`}
      style={style}
      onLoad={localOnLoad}
      onError={localOnError}
    />
  );
};

export default LazyImage;
