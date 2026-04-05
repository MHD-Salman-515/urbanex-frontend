import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type ScrollExpandMediaProps = {
  mediaType?: "image" | "video";
  mediaSrc: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
};

export default function ScrollExpandMedia({
  mediaType = "image",
  mediaSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand = "Scroll to expand",
  textBlend = false,
  children,
}: ScrollExpandMediaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isMobileState, setIsMobileState] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobileState(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleScroll = () => {
    if (!mediaFullyExpanded) {
      window.scrollTo(0, 0);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
      e.preventDefault();

      const newProgress = Math.max(scrollProgress + e.deltaY * 0.001, 0);
      setScrollProgress(newProgress);

      if (newProgress <= 0) {
        setMediaFullyExpanded(false);
        setShowContent(false);
      }

      return;
    }

    if (!mediaFullyExpanded) {
      e.preventDefault();

      const scrollDelta = e.deltaY * 0.001;
      const newProgress = Math.min(
        Math.max(scrollProgress + scrollDelta, 0),
        1
      );

      setScrollProgress(newProgress);

      if (newProgress >= 1) {
        setMediaFullyExpanded(true);
        setShowContent(true);
      } else if (newProgress < 0.75) {
        setMediaFullyExpanded(false);
        setShowContent(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollProgress, mediaFullyExpanded]);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const mediaRadius = mediaFullyExpanded ? 0 : Math.max(24 - scrollProgress * 20, 0);
  const mediaY = mediaFullyExpanded ? 0 : 70 - scrollProgress * 70;
  const headerY = -(Math.min(scrollProgress * 4, 1) * 36);
  const headerOpacity = showContent ? 0 : Math.max(1 - scrollProgress * 2, 0.5);

  return (
    <section ref={containerRef} className="relative h-[220vh] bg-[#0B0F19] text-white/90">
      <div className="sticky top-0 h-screen overflow-hidden">
        <img
          src={bgImageSrc}
          alt="Background"
          className="w-screen h-screen object-cover"
        />

        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: mediaFullyExpanded ? 0.7 : 0.4 }}
        />

        <motion.div
          className="absolute top-8 left-0 right-0 z-20 px-4 text-center sm:top-10"
          style={{ y: headerY, opacity: headerOpacity }}
        >
          {date ? (
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-white/80 sm:text-sm">
              {date}
            </p>
          ) : null}
          {title ? (
            <h1
              className={
                textBlend
                  ? "mx-auto max-w-5xl text-3xl font-semibold leading-tight text-white/90 mix-blend-screen sm:text-5xl lg:text-6xl"
                  : "mx-auto max-w-5xl text-3xl font-semibold leading-tight text-white/90 sm:text-5xl lg:text-6xl"
              }
            >
              {title}
            </h1>
          ) : null}
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <motion.div
            className="max-w-none"
            style={{ width: mediaWidth, height: mediaHeight, y: mediaY }}
          >
            <motion.div
              className="h-full w-full overflow-hidden border border-white/15 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
              style={{ borderRadius: mediaRadius }}
            >
              {mediaType === "video" ? (
                <video
                  src={mediaSrc}
                  className="h-full w-full rounded-xl object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt={title || "Media"}
                  className="h-full w-full rounded-xl object-cover"
                />
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.p
          className="absolute bottom-8 left-0 right-0 z-20 px-4 text-center text-xs tracking-[0.3em] text-white/80 sm:text-sm"
          style={{ opacity: showContent ? 0 : headerOpacity }}
        >
          {scrollToExpand}
        </motion.p>

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-white/90"
          >
            <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md sm:p-8">
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
