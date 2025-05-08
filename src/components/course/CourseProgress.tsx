import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Award, Star, Trophy } from "lucide-react";

import { useProgressStore } from "@/stores/useProgressStore";

export default function CourseProgress() {
  const { overallProgress } = useProgressStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from current to target value
    const timer = setTimeout(() => {
      setProgress(overallProgress || 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [overallProgress]);

  if (typeof overallProgress !== "number") return null;

  // Get progress color based on percentage
  const getProgressColor = () => {
    if (progress < 30)
      return { bg: "from-blue-400 to-blue-500", text: "text-blue-500" };
    if (progress < 70)
      return { bg: "from-amber-400 to-orange-400", text: "text-amber-500" };
    return { bg: "from-green-400 to-emerald-500", text: "text-emerald-500" };
  };

  // Get colorful icon based on progress
  const getProgressIcon = () => {
    if (progress === 100) {
      return (
        <div className="relative">
          <div className="absolute inset-0 blur-sm bg-yellow-300 rounded-full opacity-40"></div>
          <div className="relative">
            <Trophy
              className="h-4 w-4"
              fill="#FBBF24"
              stroke="#F59E0B"
              strokeWidth={1.5}
            />
          </div>
        </div>
      );
    }

    if (progress >= 50) {
      return (
        <div className="relative">
          <div className="absolute inset-0 blur-sm bg-amber-200 rounded-full opacity-30"></div>
          <div className="relative">
            <Award
              className="h-4 w-4"
              fill="url(#award-gradient)"
              stroke="#D97706"
              strokeWidth={1.5}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 blur-sm bg-blue-200 rounded-full opacity-30"></div>
        <div className="relative">
          <Star
            className="h-4 w-4"
            fill="url(#star-gradient)"
            stroke="#3B82F6"
            strokeWidth={1.5}
          />
        </div>
      </div>
    );
  };

  const colors = getProgressColor();

  return (
    <motion.div
      className="flex items-center gap-1.5 group relative w-[160px]"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient
            id="star-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient
            id="award-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <radialGradient
            id="trophy-glow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
        </defs>
      </svg>

      <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/dots-pattern.png')] bg-repeat-x opacity-5" />

        {/* Progress bar with gradient */}
        <motion.div
          className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${colors.bg}`}
          style={{ width: 0 }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Animated particles for celebration effect */}
        {progress >= 75 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 h-0.5 rounded-full bg-white"
                animate={{
                  y: [0, -10, 0],
                  x: [0, i * 5 - 5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  repeatDelay: 2,
                }}
                style={{ left: `${75 + i * 5}%` }}
              />
            ))}
          </>
        )}

        {/* Shine effect */}
        <motion.div
          className="absolute top-0 bottom-0 w-4 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
      </div>

      {/* Percentage display with pop effect on change */}
      <div className="flex items-center gap-0.5">
        <motion.div
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("text-xs font-medium", colors.text)}
        >
          {Math.round(progress)}%
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{
            rotate: [0, -5, 5, -5, 0],
            scale: 1.15,
            transition: { duration: 0.5 },
          }}
        >
          {getProgressIcon()}
        </motion.div>
      </div>

      {/* Tooltip */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md z-10 whitespace-nowrap">
        Tiến độ: {Math.round(progress)}% hoàn thành
      </div>
    </motion.div>
  );
}
