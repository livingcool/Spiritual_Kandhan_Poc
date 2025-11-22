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
                        className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-orange-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-orange-900">Beta Version Notice</h2>
                        </div>

                        <div className="space-y-3 mb-6 text-gray-700">
                            <p className="text-sm leading-relaxed">
                                <strong>Kandhan Karunai</strong> is currently in <strong>beta stage</strong>.
                            </p>
                            <p className="text-sm leading-relaxed">
                                Your conversations may be used for model development and improvement purposes.
                            </p>
                            <p className="text-sm leading-relaxed text-orange-800 font-medium">
                                By continuing, you agree to allow your data to be used for training and enhancing the spiritual experience.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onDecline}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Decline
                            </button>
                            <button
                                onClick={onAccept}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
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
