"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFinished(true);
            if (onComplete) onComplete();
          }, 400);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between p-8 md:p-16 bg-[#070708] text-[#f4f1ea] select-none"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center text-xs tracking-widestLuxury uppercase font-sans text-neutral-400">
            <span>Gopal Lahoti</span>
            <span>Interior Architecture</span>
            <span>Est. 2018</span>
          </div>

          {/* Center Brand Monogram / Title */}
          <div className="my-auto text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif text-3xl md:text-6xl tracking-widest uppercase text-gold-gradient"
            >
              Gopal Lahoti
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xs md:text-sm tracking-ultraLuxury uppercase font-sans text-neutral-300"
            >
              Spatial Harmony & Bespoke Luxury
            </motion.p>
          </div>

          {/* Bottom Progress Counter */}
          <div className="flex justify-between items-end border-t border-white/10 pt-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
                Loading Spatial Experience
              </span>
              <div className="w-48 md:w-80 h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c5a880] transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="font-serif text-4xl md:text-6xl text-[#c5a880] font-light">
              {progress.toString().padStart(2, "0")}
              <span className="text-xl md:text-2xl text-neutral-500 font-sans ml-1">%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
