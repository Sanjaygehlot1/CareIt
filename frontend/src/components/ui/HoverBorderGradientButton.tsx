"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradientButton({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1.5,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (current: Direction): Direction => {
    const dirs: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const idx = dirs.indexOf(current);
    const next = clockwise
      ? (idx - 1 + dirs.length) % dirs.length
      : (idx + 1) % dirs.length;
    return dirs[next];
  };

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20% 50% at 50% 0%, #fff 0%, transparent 100%)",
    LEFT: "radial-gradient(16% 43% at 0% 50%, #fff 0%, transparent 100%)",
    BOTTOM: "radial-gradient(20% 50% at 50% 100%, #fff 0%, transparent 100%)",
    RIGHT: "radial-gradient(16% 43% at 100% 50%, #fff 0%, transparent 100%)",
  };

  const highlight =
    "radial-gradient(75% 180% at 50% 50%, #ff9d00 0%, rgba(255, 157, 0, 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prev) => rotateDirection(prev));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex items-center justify-center w-fit p-px rounded-full border border-transparent overflow-visible transition-all ease-in-out duration-700",
        "bg-black/20 hover:bg-black/10 dark:bg-white/20 shadow-[0_0_15px_rgba(255,157,0,0.3)] hover:shadow-[0_0_25px_rgba(255,157,0,0.6)]",
        containerClassName
      )}
      {...props}
    >
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        className={cn(
          "relative z-10 px-5 py-2.5 rounded-[inherit] text-white font-semibold transition-all ease-in-out duration-500",
          "hover:scale-[1.04]",
          className
        )}
      >
        {children}
      </div>

      <motion.div
        className="absolute inset-0 z-0 rounded-[inherit] overflow-hidden"
        style={{
          filter: "blur(3px)",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{
          ease: "easeInOut",
          duration: hovered ? 0.8 : duration ?? 1.2,
        }}
      />

      <div className="absolute inset-[2px] bg-black/80 rounded-[100px] pointer-events-none" />
    </Tag>
  );
}
