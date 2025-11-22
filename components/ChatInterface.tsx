'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConsentModal from './ConsentModal';
import UserInfoForm from './UserInfoForm';
import { supabase } from '@/lib/supabase';

type Message = {
    role: 'user' | 'model';
    content: string;
};

type UserInfo = {
    id?: string;
    name: string;
    age: number;
    email: string;
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [hasConsent, setHasConsent] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check consent and user info on mount
    useEffect(() => {
        const consent = localStorage.getItem('kandhan_consent');
        const storedUserInfo = localStorage.getItem('kandhan_user_info');

        if (consent === 'true') {
            setHasConsent(true);
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
            } else {
                setShowUserForm(true);
            }
        } else {
            setShowConsent(true);
        }
    }, []);

    const handleAcceptConsent = () => {
        localStorage.setItem('kandhan_consent', 'true');
        setHasConsent(true);
        setShowConsent(false);
        setShowUserForm(true); // Show user form after consent
    };

    const handleDeclineConsent = () => {
        setShowConsent(false);
    };

    const handleUserInfoSubmit = async (data: { name: string; age: number; email: string }) => {
        try {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', data.email)
                .single();

            let userId;
            if (existingUser) {
                userId = existingUser.id;
                setUserInfo({ ...data, id: userId });
            } else {
                // Create new user
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert([data])
                    .select()
                    .single();

                if (error) throw error;
                userId = newUser.id;
                setUserInfo({ ...data, id: userId });
            }

            localStorage.setItem('kandhan_user_info', JSON.stringify({ ...data, id: userId }));
            setShowUserForm(false);
        } catch (error) {
            console.error('Failed to save user info:', error);
            alert('Failed to save user information. Please try again.');
        }
    };

    const saveConversationToSupabase = async (userMsg: string, modelMsg: string, tokenData: any) => {
        if (!userInfo?.id) return;

        try {
            await supabase.from('conversations').insert([{
                user_id: userInfo.id,
                user_message: userMsg,
                model_response: modelMsg,
                prompt_tokens: tokenData?.promptTokens || 0,
                candidates_tokens: tokenData?.candidatesTokens || 0,
                total_tokens: tokenData?.totalTokens || 0,
            }]);
        } catch (error) {
            console.error('Failed to save conversation to Supabase:', error);
        }
    };

    const logConversation = async (userMsg: string, modelMsg: string) => {
        if (!hasConsent) return;

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

    // Fetch mandatory starter on mount if not already present
    useEffect(() => {
        const fetchStarter = async () => {
            if (hasStarted || !hasConsent) return;

            try {
                setIsLoading(true);
                // We send an empty history to trigger the mandatory starter from the backend
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: '', history: [] }),
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
    }, [hasStarted, hasConsent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    // Sliding window: keep only last 6 messages (3 exchanges) to reduce tokens
                    // This maintains recent context while drastically reducing token usage
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to send message');
            }

            const data = await response.json();
            if (data.text) {
                setMessages((prev) => [...prev, { role: 'model', content: data.text }]);
                // Log conversation for model training (local file)
                await logConversation(userMessage, data.text);
                // Save to Supabase database
                await saveConversationToSupabase(userMessage, data.text, data.tokenUsage);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally handle error in UI
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[80vh] max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-200/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-200 animate-pulse" />
                <h2 className="text-lg font-semibold tracking-wide">Murugan Arul-Jyoti Voice</h2>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent">
                <AnimatePresence>
                    {messages.map((msg, index) => {
                        // Parse whisper from model messages (text between asterisks)
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
                                    className={`max-w-[85%] rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-orange-100 text-orange-900 rounded-tr-none border border-orange-200 p-4'
                                        : 'bg-gradient-to-br from-white to-orange-50/30 text-gray-800 rounded-tl-none border border-orange-100/50'
                                        }`}
                                >
                                    {msg.role === 'model' ? (
                                        <>
                                            <p className="whitespace-pre-wrap font-medium p-4 pb-2">{mainContent}</p>
                                            {hasWhisper && whispers.map((whisper, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-400 rounded-r-lg mx-2 mb-2"
                                                >
                                                    <p className="text-orange-800 italic font-semibold text-center text-base leading-relaxed">
                                                        "{whisper}"
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white/50 p-3 rounded-2xl rounded-tl-none flex space-x-2 items-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/20 border-t border-orange-100/30">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="உங்கள் மனதை திறங்கள்... (Pour your heart out...)"
                        className="w-full bg-white/80 text-gray-800 placeholder-gray-500 rounded-full py-3 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-inner transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Consent Modal */}
            <ConsentModal
                isOpen={showConsent}
                onAccept={handleAcceptConsent}
                onDecline={handleDeclineConsent}
            />

            {/* User Info Form */}
            <UserInfoForm
                isOpen={showUserForm}
                onSubmit={handleUserInfoSubmit}
            />
        </div>
    );
}
