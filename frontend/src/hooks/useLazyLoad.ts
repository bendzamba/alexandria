import { useEffect, useState, useRef } from "react";

const useLazyLoad = (rootRef: React.RefObject<HTMLElement>) => {
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  if (!rootRef) {
    console.log("Could not find root element");
  }

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleImages((prev) => {
          const updated = new Set(prev);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              updated.add(target.dataset.src as string);
            }
          });
          return updated;
        });
      },
      { root: rootRef.current, threshold: 0.1, rootMargin: "0px 0px 50px 0px" }
    );

    return () => observerRef.current?.disconnect();
  }, [rootRef]);

  return {
    observe: (el: Element | null) => el && observerRef.current?.observe(el),
    visibleImages,
  };
};

export default useLazyLoad;
