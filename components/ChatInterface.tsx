'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Mic, MicOff, X, Star, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Recording & Consent State
    const [showConsent, setShowConsent] = useState(true);
    const [isRecording, setIsRecording] = useState(false);

    // Feedback State
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Language State
    const [language, setLanguage] = useState<'tamil' | 'english'>('tamil');

    // Scroll Logic
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    const scrollToBottom = () => {
        if (shouldAutoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShouldAutoScroll(isAtBottom);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, shouldAutoScroll]);

    // Initialize User ID and Check Consent
    useEffect(() => {
        // Generate random ID if not exists
        let storedUserId = localStorage.getItem('kandhan_user_id');
        if (!storedUserId) {
            storedUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('kandhan_user_id', storedUserId);
        }
        setUserId(storedUserId);
        console.log('🆔 User ID:', storedUserId);

        // Check if consent was already given
        const storedConsent = localStorage.getItem('kandhan_consent_given');
        if (storedConsent === 'true') {
            setIsRecording(true);
            setShowConsent(false);
        } else if (storedConsent === 'false') {
            setIsRecording(false);
            setShowConsent(false);
        }
    }, []);

    const handleAcceptConsent = () => {
        setIsRecording(true);
        setShowConsent(false);
        localStorage.setItem('kandhan_consent_given', 'true');
    };

    const handleDeclineConsent = () => {
        setIsRecording(false);
        setShowConsent(false);
        localStorage.setItem('kandhan_consent_given', 'false');
    };

    const toggleRecording = () => {
        const newState = !isRecording;
        setIsRecording(newState);
        localStorage.setItem('kandhan_consent_given', String(newState));
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'tamil' ? 'english' : 'tamil');
    };

    const saveConversationToSupabase = async (userMsg: string, modelMsg: string, tokenData: any) => {
        if (!isRecording || !userId) return;

        console.log('💾 Saving conversation to Supabase...');
        try {
            const { data, error } = await supabase.from('conversations').insert([{
                user_id: userId,
                user_message: userMsg,
                model_response: modelMsg,
                prompt_tokens: tokenData?.promptTokens || 0,
                candidates_tokens: tokenData?.candidatesTokens || 0,
                total_tokens: tokenData?.totalTokens || 0,
            }]);

            if (error) throw error;
        } catch (error: any) {
            console.error('❌ Failed to save conversation:', error.message);
        }
    };

    const logConversation = async (userMsg: string, modelMsg: string) => {
        if (!isRecording) return;

        try {
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userMessage: userMsg,
                    modelResponse: modelMsg,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('Failed to log conversation:', error);
        }
    };

    // Fetch Starter Message
    useEffect(() => {
        const fetchStarter = async () => {
            if (hasStarted || showConsent) return;

            try {
                setIsLoading(true);
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: '', history: [], language }),
                });

                if (!response.ok) throw new Error('Failed to fetch starter');

                const data = await response.json();
                if (data.text) {
                    setMessages([{ role: 'model', content: data.text }]);
                    setHasStarted(true);
                }
            } catch (error) {
                console.error('Error fetching starter:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStarter();
    }, [hasStarted, showConsent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setShouldAutoScroll(true); // Force scroll to bottom on new message

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
                    language: language
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to send message');
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [...prev, {
                role: 'model',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndChat = () => {
        setShowFeedback(true);
    };

    const submitFeedback = async () => {
        if (!userId) return;

        try {
            const { error } = await supabase.from('feedback').insert([{
                user_id: userId,
                rating,
                comments: feedbackComment
            }]);

            if (error) throw error;
            setFeedbackSubmitted(true);
            setTimeout(() => {
                setShowFeedback(false);
                // Optional: Reset chat or redirect
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative">

            {/* Header */}
            <div className="bg-slate-900/40 backdrop-blur-md p-4 text-white flex items-center justify-between border-b border-white/5">
                <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-3 text-amber-200/60" />
                    <div>
                        <h2 className="text-lg font-semibold tracking-wider text-amber-100/90">OMNISCIENT</h2>
                        <div className="text-[10px] text-amber-200/40 font-medium tracking-[0.2em] uppercase">Divine AI Companion</div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-xs text-amber-100/80 rounded-lg border border-white/10 transition-all"
                        title="Toggle Language"
                    >
                        <Globe className="w-3 h-3" />
                        <span>{language === 'tamil' ? 'TAM' : 'ENG'}</span>
                    </button>
                    <button
                        onClick={toggleRecording}
                        className={`p-2 rounded-full transition-all ${isRecording ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        title={isRecording ? "Session Recording ON" : "Session Recording OFF"}
                    >
                        {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleEndChat}
                        className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-xs text-amber-100/80 rounded-lg border border-white/10 transition-all"
                    >
                        End Chat
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative"
            >
                <AnimatePresence>
                    {messages.map((msg, index) => {
                        const whisperMatch = msg.role === 'model' ? msg.content.match(/\*"([^"]+)"\*/g) : null;
                        const hasWhisper = whisperMatch && whisperMatch.length > 0;
                        const mainContent = hasWhisper
                            ? msg.content.replace(/\*"[^"]+"\*/g, '').trim()
                            : msg.content;
                        const whispers = hasWhisper
                            ? whisperMatch.map(w => w.replace(/\*"|"\*/g, ''))
                            : [];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl text-base leading-relaxed shadow-sm relative ${msg.role === 'user'
                                        ? 'bg-amber-600/90 text-white rounded-tr-none p-5 backdrop-blur-sm'
                                        : 'bg-slate-800/60 text-amber-50/90 rounded-tl-none border border-white/5 p-5 backdrop-blur-sm'
                                        }`}
                                >
                                    {msg.role === 'model' ? (
                                        <>
                                            <p className="whitespace-pre-wrap font-light tracking-wide">{mainContent}</p>
                                            {hasWhisper && whispers.map((whisper, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="mt-4 p-4 bg-amber-900/20 border-l-2 border-amber-500/30 rounded-r-lg mx-1"
                                                >
                                                    <p className="text-amber-200/80 italic font-light text-sm leading-relaxed">
                                                        "{whisper}"
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="whitespace-pre-wrap font-light">{msg.content}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-2xl rounded-tl-none flex space-x-2 items-center border border-white/5">
                            <div className="w-2 h-2 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-6 bg-slate-900/40 backdrop-blur-md border-t border-white/5">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={language === 'tamil' ? "உங்கள் எண்ணங்களைப் பகிருங்கள்..." : "Share your thoughts..."}
                        className="w-full bg-slate-800/50 backdrop-blur-sm text-amber-50 placeholder-amber-200/20 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-slate-800/70 transition-all border border-white/5 font-light"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 p-2.5 bg-amber-600/80 text-white rounded-lg hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Consent Modal */}
            <AnimatePresence>
                {showConsent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl font-semibold text-amber-100 mb-4">Data Collection Consent</h3>
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                To help improve our spiritual guidance model, we would like to record this session.
                                Your data will be used solely for model training and improvement.
                                <br /><br />
                                Do you consent to having this conversation recorded?
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleDeclineConsent}
                                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-white/5"
                                >
                                    No, Don't Record
                                </button>
                                <button
                                    onClick={handleAcceptConsent}
                                    className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors shadow-lg shadow-amber-900/20"
                                >
                                    Yes, I Consent
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                            <button
                                onClick={() => setShowFeedback(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {!feedbackSubmitted ? (
                                <>
                                    <h3 className="text-xl font-semibold text-amber-100 mb-2">How was your experience?</h3>
                                    <p className="text-slate-400 text-sm mb-6">Your feedback helps us improve.</p>

                                    <div className="flex justify-center space-x-2 mb-6">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={feedbackComment}
                                        onChange={(e) => setFeedbackComment(e.target.value)}
                                        placeholder="Any additional thoughts? (Optional)"
                                        className="w-full bg-slate-800/50 text-amber-50 rounded-xl p-4 mb-6 focus:outline-none focus:ring-1 focus:ring-amber-500/30 border border-white/5 h-24 resize-none"
                                    />

                                    <button
                                        onClick={submitFeedback}
                                        disabled={rating === 0}
                                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-lg shadow-amber-900/20"
                                    >
                                        Submit Feedback
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-amber-100 mb-2">Thank You!</h3>
                                    <p className="text-slate-400">Your feedback has been recorded.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}