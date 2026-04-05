import { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const mediaScale = useTransform(scrollYProgress, [0, 0.45], [0.68, 1]);
  const mediaY = useTransform(scrollYProgress, [0, 0.45], [70, 0]);
  const mediaRadius = useTransform(scrollYProgress, [0, 0.45], [24, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.5, 0.28, 0.2]);
  const headerY = useTransform(scrollYProgress, [0, 0.25], [0, -36]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.6]);
  const contentOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.35, 0.6], [40, 0]);

  return (
    <section ref={containerRef} className="relative h-[220vh] bg-black text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        <img
          src={bgImageSrc}
          alt="Background"
          className="w-screen h-screen object-cover"
        />

        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
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
                  ? "mx-auto max-w-5xl text-3xl font-semibold leading-tight text-white mix-blend-screen sm:text-5xl lg:text-6xl"
                  : "mx-auto max-w-5xl text-3xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
              }
            >
              {title}
            </h1>
          ) : null}
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <motion.div
            className="h-[46vh] w-[90vw] sm:h-[56vh] sm:w-[78vw] lg:h-[62vh] lg:w-[72vw]"
            style={{ scale: mediaScale, y: mediaY }}
          >
            <motion.div
              className="h-full w-full overflow-hidden border border-white/15 bg-black/30 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
              style={{ borderRadius: mediaRadius }}
            >
              {mediaType === "video" ? (
                <video
                  src={mediaSrc}
                  className="w-full h-full object-cover rounded-xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt={title || "Media"}
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.p
          className="absolute bottom-8 left-0 right-0 z-20 px-4 text-center text-xs tracking-[0.3em] text-white/80 sm:text-sm"
          style={{ opacity: headerOpacity }}
        >
          {scrollToExpand}
        </motion.p>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-20 z-30 px-4 sm:bottom-24"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-white/15 bg-black/35 p-6 backdrop-blur-md sm:p-8">
          {children}
        </div>
      </motion.div>
    </section>
  );
}
