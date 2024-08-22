import { useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, elementClass, style, rootElement }) => {
  const imgRef = useRef();

  console.log('root element', rootElement);

  useEffect(() => {

    if (!rootElement) return;
    
    const currentImgRef = imgRef.current;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    imgRef.current.src = src;
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            root: rootElement || null,
            threshold: 0.1,
            rootMargin: '0px 0px 50px 0px',
        }
    );
    
    if (currentImgRef) {
        observer.observe(currentImgRef);
    }
    
  }, [src, rootElement]);

  return <img ref={imgRef} data-src={src} alt={alt} loading="lazy" className={elementClass} style={style}/>;
};

export default LazyImage;