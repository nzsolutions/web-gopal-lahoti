"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Enable custom cursor styles
    document.body.classList.add("custom-cursor-active");

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest("[data-cursor]") as HTMLElement;
      const clickableEl = target.closest("button, a, input, [role='button']");

      if (interactiveEl) {
        const text = interactiveEl.getAttribute("data-cursor") || "";
        setCursorText(text);
        setIsHovered(true);
      } else if (clickableEl) {
        setCursorText("");
        setIsHovered(true);
      } else {
        setCursorText("");
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  const [isCinematic, setIsCinematic] = useState(false);

  useEffect(() => {
    const updateCinematic = () => {
      setIsCinematic(document.body.classList.contains("cinematic-active"));
    };
    updateCinematic();
    const observer = new MutationObserver(updateCinematic);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!isVisible || isCinematic) return null;

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Primary Dot / Ring */}
      <motion.div
        className="fixed top-0 left-0 flex items-center justify-center rounded-full pointer-events-none z-50"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
        }}
        animate={{
          width: cursorText ? 84 : isHovered ? 48 : 12,
          height: cursorText ? 84 : isHovered ? 48 : 12,
          backgroundColor: cursorText
            ? "rgba(197, 168, 128, 0.95)"
            : isHovered
            ? "rgba(245, 242, 235, 0.22)"
            : "#c5a880",
          border: isHovered && !cursorText ? "1px solid rgba(197, 168, 128, 0.7)" : "none",
        }}
        transition={{ type: "spring", damping: 24, stiffness: 350 }}
      >
        {cursorText && (
          <span className="text-[10px] uppercase font-sans tracking-widest font-semibold text-luxury-bg text-center px-2">
            {cursorText}
          </span>
        )}
      </motion.div>
    </div>
  );
}
