'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConsentModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export default function ConsentModal({ isOpen, onAccept, onDecline }: ConsentModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(251,146,60,0.2)] max-w-md w-full p-6 border border-orange-500/30"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-500/20 rounded-full border border-orange-500/30">
                                <AlertCircle className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold text-orange-100">Beta Version Notice</h2>
                        </div>

                        <div className="space-y-3 mb-6 text-orange-100/80">
                            <p className="text-sm leading-relaxed">
                                <strong>Kandhan Karunai</strong> is currently in <strong>beta stage</strong>.
                            </p>
                            <p className="text-sm leading-relaxed">
                                Your conversations may be used for model development and improvement purposes.
                            </p>
                            <p className="text-sm leading-relaxed text-orange-300 font-medium">
                                By continuing, you agree to allow your data to be used for training and enhancing the spiritual experience.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onDecline}
                                className="flex-1 px-4 py-2 bg-slate-800 text-orange-200 rounded-lg hover:bg-slate-700 transition-colors font-medium border border-slate-700"
                            >
                                Decline
                            </button>
                            <button
                                onClick={onAccept}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all font-medium border border-orange-500/30"
                            >
                                I Agree
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
