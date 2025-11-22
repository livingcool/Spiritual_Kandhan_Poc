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
    const [showConsent, setShowConsent] = useState(true);
    const [hasConsent, setHasConsent] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('kandhan_user_info');
        if (storedUserInfo) {
            try {
                const parsed = JSON.parse(storedUserInfo);
                setUserInfo(parsed);
                console.log('✅ Loaded user info from localStorage:', parsed);
            } catch (error) {
                console.error('❌ Failed to parse stored user info:', error);
            }
        }
    }, []);

    const handleAcceptConsent = () => {
        setHasConsent(true);
        setShowConsent(false);
        setShowUserForm(true);
    };

    const handleDeclineConsent = () => {
        setHasConsent(false);
        setShowConsent(false);
        alert('You must accept the consent to use this application.');
    };

    const handleUserInfoSubmit = async (data: { name: string; age: number; email: string }) => {
        console.log('🔵 Submitting user info:', data);
        try {
            console.log('🔍 Checking if user exists...');
            const { data: existingUser, error: selectError } = await supabase
                .from('users')
                .select('*')
                .eq('email', data.email)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                console.error('❌ Error checking user:', selectError);
                throw selectError;
            }

            let userId;
            if (existingUser) {
                console.log('✅ User exists:', existingUser.id);
                userId = existingUser.id;
                setUserInfo({ ...data, id: userId });
            } else {
                console.log('➕ Creating new user...');
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert([data])
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Error creating user:', error);
                    throw error;
                }
                console.log('✅ User created:', newUser.id);
                userId = newUser.id;
                setUserInfo({ ...data, id: userId });
            }

            localStorage.setItem('kandhan_user_info', JSON.stringify({ ...data, id: userId }));
            setShowUserForm(false);
            console.log('✅ User info saved successfully!');
        } catch (error: any) {
            console.error('❌ Failed to save user info:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            alert(`Failed to save user information: ${error.message}\n\nPlease check:\n1. Tables are created in Supabase\n2. RLS is disabled\n3. Browser console for details`);
        }
    };

    const saveConversationToSupabase = async (userMsg: string, modelMsg: string, tokenData: any) => {
        if (!userInfo?.id) {
            console.warn('⚠️ No user ID, skipping Supabase save');
            return;
        }

        console.log('💾 Saving conversation to Supabase...');
        try {
            const { data, error } = await supabase.from('conversations').insert([{
                user_id: userInfo.id,
                user_message: userMsg,
                model_response: modelMsg,
                prompt_tokens: tokenData?.promptTokens || 0,
                candidates_tokens: tokenData?.candidatesTokens || 0,
                total_tokens: tokenData?.totalTokens || 0,
            }]).select();

            if (error) {
                console.error('❌ Supabase save error:', error);
                throw error;
            }
            console.log('✅ Conversation saved to Supabase:', data);
        } catch (error: any) {
            console.error('❌ Failed to save conversation to Supabase:', error);
            console.error('Error details:', error.message);
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

    useEffect(() => {
        const fetchStarter = async () => {
            if (hasStarted || !hasConsent || !userInfo) return;

            try {
                setIsLoading(true);
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
    }, [hasStarted, hasConsent, userInfo]);

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
                await logConversation(userMessage, data.text);
                await saveConversationToSupabase(userMessage, data.text, data.tokenUsage);
            }
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

    return (
        <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative">

            {/* Header - Clean & Minimal */}
            <div className="bg-slate-900/40 backdrop-blur-md p-6 text-white flex items-center justify-center border-b border-white/5">
                <Sparkles className="w-5 h-5 mr-3 text-amber-200/60" />
                <div className="text-center">
                    <h2 className="text-lg font-semibold tracking-wider text-amber-100/90">
                        OMNISCIENT
                    </h2>
                    <div className="text-[10px] text-amber-200/40 font-medium tracking-[0.2em] uppercase mt-1">Divine AI Companion</div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative">

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

                {isLoading && (
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
                        placeholder="Share your thoughts..."
                        className="w-full bg-slate-800/50 backdrop-blur-sm text-amber-50 placeholder-amber-200/20 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:bg-slate-800/70 transition-all border border-white/5 font-light"
                        disabled={isLoading || !userInfo}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || !userInfo}
                        className="absolute right-3 p-2.5 bg-amber-600/80 text-white rounded-lg hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
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