"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const item = {
  hidden: { opacity: 0, transform: "translateY(14px)" },
  show: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
};

export function Stagger({ children, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className} variants={item}>
      {children}
    </Tag>
  );
}
