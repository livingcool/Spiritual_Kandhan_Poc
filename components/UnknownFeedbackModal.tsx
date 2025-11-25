'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UnknownFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function UnknownFeedbackModal({ isOpen, onClose, userId }: UnknownFeedbackModalProps) {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim() || !userId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    content: feedback.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            setIsSuccess(true);
            setFeedback('');
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                                <MessageSquarePlus className="w-6 h-6 text-amber-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-amber-100">Share Feedback</h2>
                        </div>

                        {!isSuccess ? (
                            <form onSubmit={handleSubmit}>
                                <p className="text-slate-400 text-sm mb-4">
                                    Have a suggestion or found an issue? Let us know!
                                </p>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Type your feedback here..."
                                    className="w-full bg-slate-800/50 text-amber-50 rounded-xl p-4 mb-6 focus:outline-none focus:ring-1 focus:ring-amber-500/30 border border-white/5 h-32 resize-none placeholder-slate-500"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!feedback.trim() || isSubmitting}
                                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 font-medium"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"
                                >
                                    <Send className="w-8 h-8 text-green-400" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-amber-100 mb-2">Thank You!</h3>
                                <p className="text-slate-400">Your feedback has been received.</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
