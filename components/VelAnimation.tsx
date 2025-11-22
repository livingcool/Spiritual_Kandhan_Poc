'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function VelAnimation() {
    return (
        <div className="relative w-64 h-96 flex items-center justify-center perspective-1000">
            {/* Glow Effect Container */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div className="w-40 h-60 bg-orange-500/30 rounded-full blur-3xl" />
            </motion.div>

            {/* 3D Rotating Vel */}
            <motion.div
                className="relative z-10 w-full h-full flex items-center justify-center"
                animate={{
                    rotateY: [0, 360],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                <svg
                    viewBox="0 0 100 200"
                    className="w-full h-full drop-shadow-[0_0_15px_rgba(255,165,0,0.8)]"
                    style={{ filter: "drop-shadow(0 0 10px gold)" }}
                >
                    <defs>
                        <linearGradient id="velGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="50%" stopColor="#FFA500" />
                            <stop offset="100%" stopColor="#FFD700" />
                        </linearGradient>
                        <linearGradient id="shaftGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#B8860B" />
                            <stop offset="50%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#B8860B" />
                        </linearGradient>
                    </defs>

                    {/* Shaft */}
                    <rect x="47" y="140" width="6" height="60" rx="2" fill="url(#shaftGradient)" />

                    {/* Blade - Left Side */}
                    <path
                        d="M50 10 Q 20 60 20 100 Q 20 130 50 150"
                        fill="url(#velGradient)"
                        stroke="#B8860B"
                        strokeWidth="0.5"
                    />

                    {/* Blade - Right Side */}
                    <path
                        d="M50 10 Q 80 60 80 100 Q 80 130 50 150"
                        fill="url(#velGradient)"
                        stroke="#B8860B"
                        strokeWidth="0.5"
                    />

                    {/* Center Line/Ridge */}
                    <path
                        d="M50 10 L 50 150"
                        stroke="#FFF"
                        strokeWidth="1"
                        strokeOpacity="0.6"
                    />

                    {/* Decorative Vibhuti/Pottu */}
                    <circle cx="50" cy="100" r="3" fill="#FF0000" />
                    <path d="M40 95 L60 95" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                    <path d="M38 90 L62 90" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                    <path d="M42 100 L58 100" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />

                </svg>
            </motion.div>
        </div>
    );
}
