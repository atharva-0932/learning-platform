"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";

const words = [
  "SkillsSphere",
  "Hello",
  "Bonjour",
  "Ciao",
  "Olà",
  "やあ",
  "Hallå",
  "Guten tag",
  "হ্যালো",
];

const opacity: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 0.85,
    transition: { duration: 1, delay: 0.2 },
  },
};

const slideUp: Variants = {
  initial: { top: 0 },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const update = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (dimension.width === 0) return;

    if (index >= words.length - 1) {
      const exitStart = window.setTimeout(() => {
        setIsExiting(true);
      }, 1000);
      const done = window.setTimeout(() => {
        onCompleteRef.current?.();
      }, 1000 + 800 + 200);
      return () => {
        window.clearTimeout(exitStart);
        window.clearTimeout(done);
      };
    }

    const delay = index === 0 ? 1000 : 150;
    const t = window.setTimeout(() => {
      setIndex((i) => i + 1);
    }, delay);
    return () => window.clearTimeout(t);
  }, [index, dimension.width]);

  const initialPath =
    dimension.width > 0
      ? `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`
      : "";

  const targetPath =
    dimension.width > 0
      ? `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`
      : "";

  const curve: Variants = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      className="fixed inset-0 z-[200] flex h-screen w-screen items-center justify-center bg-background text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-muted/30 dark:from-primary/10 dark:to-muted/20"
        aria-hidden
      />
      {dimension.width > 0 && (
        <>
          <svg
            className="absolute top-0 z-0 h-[calc(100%+300px)] w-full text-muted"
            aria-hidden
          >
            <motion.path
              variants={curve}
              initial="initial"
              animate={isExiting ? "exit" : "initial"}
              className="fill-muted"
            />
          </svg>
          <motion.p
            variants={opacity}
            initial="initial"
            animate="enter"
            className="absolute z-10 flex items-center text-4xl font-medium text-foreground md:text-5xl lg:text-6xl"
          >
            <span className="mr-2.5 block h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/40" />
            {words[index]}
          </motion.p>
        </>
      )}
    </motion.div>
  );
}
