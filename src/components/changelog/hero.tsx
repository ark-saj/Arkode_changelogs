"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero({ brandName }: { brandName: string }) {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="relative flex flex-col items-center pt-16 text-center sm:pt-24"
    >
      <motion.span
        variants={item}
        className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand"
      >
        <Sparkles className="h-4 w-4" />
        {brandName} · Centro de Novedades
      </motion.span>

      <motion.h1
        variants={item}
        className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
      >
        Novedades del <span className="brand-gradient-text">Sistema</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
      >
        Mantente al día con las mejoras que se implementan para facilitar tu
        trabajo.
      </motion.p>

      <motion.div
        variants={item}
        className="mt-8 flex items-center gap-2 text-muted-foreground"
        aria-hidden
      >
        <span className="h-1.5 w-8 rounded-full bg-brand" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      </motion.div>

      <motion.div variants={item} className="mt-10 text-muted-foreground/70">
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </motion.div>
    </motion.section>
  );
}
