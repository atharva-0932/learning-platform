"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MatchScoreGaugeProps {
    score: number;
    size?: number;
    strokeWidth?: number;
}

export function MatchScoreGauge({
    score,
    size = 200,
    strokeWidth = 15,
}: MatchScoreGaugeProps) {
    const [mounted, setMounted] = useState(false);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: mounted ? offset : circumference }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="text-primary"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-4xl font-bold text-foreground"
                >
                    {score}%
                </motion.span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Match
                </span>
            </div>
        </div>
    );
}
