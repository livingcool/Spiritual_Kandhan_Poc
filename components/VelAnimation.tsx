'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VelAnimationProps {
    side?: 'left' | 'right';
}

export default function VelAnimation({ side = 'left' }: VelAnimationProps) {
    const isLeft = side === 'left';

    return (
        <div className="relative w-48 h-[600px] flex items-center justify-center">
            {/* Soft Ambient Glow - Very Subtle */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div className="w-32 h-64 bg-amber-500/20 rounded-full blur-3xl" />
            </motion.div>

            {/* 3D Rotating Vel - Clean & Elegant */}
            <motion.div
                className="relative z-10 w-full h-full flex items-center justify-center"
                animate={{
                    rotateY: isLeft ? [0, 360] : [360, 0],
                }}
                transition={{
                    rotateY: {
                        duration: 15, // Slower, more majestic rotation
                        repeat: Infinity,
                        ease: "linear",
                    },
                }}
                style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px",
                }}
            >
                <svg
                    viewBox="0 0 100 240"
                    className="w-full h-full"
                    style={{
                        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))", // Subtle shadow for depth
                    }}
                >
                    <defs>
                        {/* Polished Gold Gradient */}
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ca8a04" /> {/* Darker Gold */}
                            <stop offset="20%" stopColor="#facc15" /> {/* Light Gold */}
                            <stop offset="40%" stopColor="#ca8a04" />
                            <stop offset="60%" stopColor="#facc15" />
                            <stop offset="80%" stopColor="#ca8a04" />
                            <stop offset="100%" stopColor="#a16207" />
                        </linearGradient>

                        {/* Shaft Gradient - Wood/Dark Gold */}
                        <linearGradient id="shaftGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#78350f" />
                            <stop offset="30%" stopColor="#b45309" />
                            <stop offset="50%" stopColor="#d97706" />
                            <stop offset="70%" stopColor="#b45309" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                    </defs>

                    {/* Shaft - Simple & Solid */}
                    <rect x="46" y="150" width="8" height="90" rx="4" fill="url(#shaftGradient)" />

                    {/* Main Blade - Elegant Curve */}
                    <path
                        d="M50 10 Q 15 80 15 130 Q 15 150 50 160 Q 85 150 85 130 Q 85 80 50 10"
                        fill="url(#goldGradient)"
                        stroke="#b45309"
                        strokeWidth="0.5"
                    />

                    {/* Center Ridge - For 3D effect */}
                    <path
                        d="M50 10 L 50 160"
                        stroke="#fef08a" // Highlight
                        strokeWidth="1"
                        opacity="0.6"
                    />

                    {/* Thiruman (Three White Lines & Red Dot) */}
                    <g transform="translate(50, 100)">
                        {/* Top Line */}
                        <line x1="-12" y1="-6" x2="12" y2="-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                        {/* Middle Line */}
                        <line x1="-16" y1="0" x2="16" y2="0" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                        {/* Bottom Line */}
                        <line x1="-12" y1="6" x2="12" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

                        {/* Kumkum (Red Dot) */}
                        <circle cx="0" cy="0" r="2.5" fill="#dc2626" />
                    </g>

                    {/* Decorative Base */}
                    <circle cx="50" cy="150" r="6" fill="url(#goldGradient)" />

                    {/* Subtle Reflection Highlight */}
                    <path
                        d="M50 15 Q 25 80 25 120"
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.2"
                        fill="none"
                    />
                </svg>
            </motion.div>
        </div>
    );
}
