'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Mic, MicOff, X, Star, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ConsentModal from './ConsentModal';

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
    const [sessionId, setSessionId] = useState<string>('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [currentStage, setCurrentStage] = useState<number>(0);

    // Recording & Consent State
    const [showConsent, setShowConsent] = useState(true);
    const [isRecording, setIsRecording] = useState(false);

    // Feedback State
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Per-message feedback tracking
    const [messageFeedback, setMessageFeedback] = useState<Record<number, 'up' | 'down'>>({});

    // Language State
    const [language, setLanguage] = useState<'tamil' | 'english'>('tamil');

    // Scroll Logic
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isStreamingResponse, setIsStreamingResponse] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            setShouldAutoScroll(isAtBottom);
        }
    };

    useEffect(() => {
        // Only auto-scroll if streaming OR user is at bottom
        if (shouldAutoScroll && !isStreamingResponse) {
            scrollToBottom();
        }
    }, [messages, shouldAutoScroll, isStreamingResponse]);

    // Initialize User ID, Session ID and Check Consent
    useEffect(() => {
        let storedUserId = localStorage.getItem('kandhan_user_id');
        if (!storedUserId) {
            storedUserId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
            localStorage.setItem('kandhan_user_id', storedUserId);
        }
        setUserId(storedUserId);

        // Generate unique session ID for this conversation
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        console.log('🆔 User ID:', storedUserId);
        console.log('📝 Session ID:', newSessionId);

        const storedConsent = localStorage.getItem('kandhan_consent_given');
        if (storedConsent === 'true') {
            setIsRecording(true);
            setShowConsent(false);
        } else if (storedConsent === 'false') {
            setIsRecording(false);
            setShowConsent(false);
        }
    }, []);

    const handleAcceptConsent = async () => {
        setIsRecording(true);
        setShowConsent(false);
        localStorage.setItem('kandhan_consent_given', 'true');

        // Create conversation record in new structure
        if (userId && sessionId) {
            try {
                const { data, error } = await supabase
                    .from('conversations_new')
                    .insert({
                        session_id: sessionId,
                        user_id: userId,
                        language: language,
                        current_stage: 0,
                        is_complete: false,
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                if (data) {
                    setConversationId(data.id);
                    console.log('✅ Created conversation:', data.id);
                }
            } catch (error) {
                console.error('❌ Failed to create conversation:', error);
            }
        }
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

    const toggleLanguage = async () => {
        const newLang = language === 'tamil' ? 'english' : 'tamil';
        setLanguage(newLang);

        // Update conversation language
        if (conversationId) {
            await supabase
                .from('conversations_new')
                .update({ language: newLang })
                .eq('id', conversationId);
        }
    };

    // Save to OLD structure (for backward compatibility)
    const saveToOldStructure = async (userMsg: string, modelMsg: string, tokenData: any) => {
        if (!isRecording || !userId) return;

        try {
            await supabase.from('conversations').insert([{
                user_id: userId,
                user_message: userMsg,
                model_response: modelMsg,
                prompt_tokens: tokenData?.promptTokens || 0,
                candidates_tokens: tokenData?.candidatesTokens || 0,
                total_tokens: tokenData?.totalTokens || 0,
            }]);
        } catch (error: any) {
            console.error('❌ Failed to save to old structure:', error.message);
        }
    };

    // Save message feedback (per-message thumbs up/down)
    const saveMessageFeedback = async (messageIndex: number, feedbackType: 'up' | 'down') => {
        if (!userId) return;

        setMessageFeedback(prev => ({ ...prev, [messageIndex]: feedbackType }));

        try {
            await supabase.from('message_feedback').insert([{
                user_id: userId,
                message_index: messageIndex,
                message_content: messages[messageIndex]?.content || '',
                feedback_type: feedbackType,
                timestamp: new Date().toISOString()
            }]);
            console.log('✅ Saved message feedback');
        } catch (error) {
            console.error('❌ Failed to save message feedback:', error);
        }
    };

    // Fetch Starter Message
    useEffect(() => {
        const fetchStarter = async () => {
            if (showConsent) return;
            if (messages.length > 1) return;

            try {
                setIsLoading(true);
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: '',
                        history: [],
                        language,
                        sessionId,
                        userId
                    }),
                });

                if (!response.ok) throw new Error('Failed to fetch starter');

                const data = await response.json();
                if (data.text) {
                    setMessages([{ role: 'model', content: data.text }]);
                    setHasStarted(true);
                    setCurrentStage(data.stage || 0);
                }
            } catch (error) {
                console.error('Error fetching starter:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStarter();
    }, [showConsent, language]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const startTime = Date.now();

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setIsStreamingResponse(false); // Don't auto-scroll during user input

        // Small delay before starting stream to let user see their message
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsStreamingResponse(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
                    language: language,
                    sessionId: sessionId,
                    userId: userId
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
            let accumulatedResponse = '';
            let metadataReceived = false;
            let responseMetadata: any = {};

            setMessages((prev) => [...prev, { role: 'model', content: '' }]);

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                if (value) {
                    const chunkValue = decoder.decode(value, { stream: true });

                    // Check for metadata at the end
                    if (chunkValue.includes('__METADATA__')) {
                        const parts = chunkValue.split('__METADATA__');
                        accumulatedResponse += parts[0];

                        if (parts[1]) {
                            const metaPart = parts[1].replace('__END__', '');
                            try {
                                responseMetadata = JSON.parse(metaPart);
                                metadataReceived = true;
                                setCurrentStage(responseMetadata.stage || 0);
                            } catch (e) {
                                console.error('Failed to parse metadata:', e);
                            }
                        }
                    } else {
                        accumulatedResponse += chunkValue;
                    }

                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage.role === 'model') {
                            lastMessage.content = accumulatedResponse;
                        }
                        return newMessages;
                    });
                }
            }

            const generationTime = Date.now() - startTime;

            // Save to old structure for backward compatibility
            await saveToOldStructure(userMessage, accumulatedResponse, {});

            console.log('📊 Response completed', {
                stage: responseMetadata.stage,
                isComplete: responseMetadata.isComplete,
                generationTime: generationTime
            });

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

    const handleEndChat = async () => {
        // Mark conversation as ended
        if (conversationId) {
            await supabase
                .from('conversations_new')
                .update({
                    ended_at: new Date().toISOString(),
                    is_complete: currentStage === 7
                })
                .eq('id', conversationId);
        }

        setShowFeedback(true);
    };

    const submitFeedback = async () => {
        if (!userId) return;

        try {
            // Save to old feedback table
            const { error } = await supabase.from('feedback').insert([{
                user_id: userId,
                rating,
                comments: feedbackComment
            }]);

            if (error) throw error;

            setFeedbackSubmitted(true);
            console.log('✅ Feedback submitted');

            setTimeout(() => {
                setShowFeedback(false);
                // Optionally reset the chat
                setMessages([]);
                setHasStarted(false);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative">

            {/* Header */}
            <div className="bg-slate-900/40 backdrop-blur-md p-4 text-white flex items-center justify-between border-b border-white/5 flex-shrink-0">
                <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-3 text-amber-200/60" />
                    <div>
                        <h2 className="text-lg font-semibold tracking-wider text-amber-100/90">Ulloli</h2>
                        <div className="text-[10px] text-amber-200/40 font-medium tracking-[0.2em] uppercase">
                            Divine AI Companion {currentStage > 0 && `• Stage ${currentStage}/7`}
                        </div>
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
                                <div className="flex flex-col max-w-[85%]">
                                    <div
                                        className={`rounded-2xl text-base leading-relaxed shadow-sm relative ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-tr-none p-5 backdrop-blur-sm shadow-amber-900/20'
                                            : 'bg-slate-800/60 text-amber-50/90 rounded-tl-none border border-amber-500/10 p-5 backdrop-blur-sm'
                                            }`}
                                        style={{
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            hyphens: 'auto'
                                        }}
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

                                    {/* Per-Message Feedback Buttons */}
                                    {msg.role === 'model' && index > 0 && (
                                        <div className="flex gap-2 ml-2 mt-2">
                                            <button
                                                onClick={() => saveMessageFeedback(index, 'up')}
                                                className={`p-1.5 rounded-lg transition-all ${messageFeedback[index] === 'up'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/40 hover:text-green-400'
                                                    }`}
                                                title="Helpful response"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => saveMessageFeedback(index, 'down')}
                                                className={`p-1.5 rounded-lg transition-all ${messageFeedback[index] === 'down'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/40 hover:text-red-400'
                                                    }`}
                                                title="Needs improvement"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                                </svg>
                                            </button>
                                        </div>
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
            <div className="p-6 bg-slate-900/40 backdrop-blur-md border-t border-white/5 flex-shrink-0">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={language === 'tamil' ? "உங்கள் எண்ணங்களைப் பகிருங்கள்..." : "Share your thoughts..."}
                        className="w-full bg-slate-800/50 backdrop-blur-sm text-amber-50 placeholder-amber-200/20 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-slate-800/70 transition-all border border-white/5 font-light"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 p-2.5 bg-amber-600/80 text-white rounded-lg hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Consent Modal */}
            <ConsentModal
                isOpen={showConsent}
                onAccept={handleAcceptConsent}
                onDecline={handleDeclineConsent}
            />

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