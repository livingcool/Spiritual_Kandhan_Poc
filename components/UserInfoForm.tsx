'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar } from 'lucide-react';

interface UserInfoFormProps {
    isOpen: boolean;
    onSubmit: (data: { name: string; age: number; email: string }) => void;
}

export default function UserInfoForm({ isOpen, onSubmit }: UserInfoFormProps) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && age && email) {
            onSubmit({ name, age: parseInt(age), email });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(251,146,60,0.2)] max-w-md w-full p-8 border border-orange-500/30"
            >
                <h2 className="text-2xl font-bold text-orange-100 mb-2 text-center">Welcome 🙏</h2>
                <p className="text-orange-200/60 text-center mb-6">
                    Please provide some basic information to get started
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-orange-200/80 mb-2">
                            <User className="inline w-4 h-4 mr-1 text-orange-400" />
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-orange-50 placeholder-orange-500/20 transition-all"
                            placeholder="Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-orange-200/80 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1 text-orange-400" />
                            Age
                        </label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-orange-50 placeholder-orange-500/20 transition-all"
                            placeholder="Age"
                            min="1"
                            max="120"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-orange-200/80 mb-2">
                            <Mail className="inline w-4 h-4 mr-1 text-orange-400" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-orange-50 placeholder-orange-500/20 transition-all"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all transform hover:scale-105 border border-orange-500/30"
                    >
                        Let's Begin
                    </button>
                </form>

                <p className="text-xs text-orange-500/50 text-center mt-4">
                    Your information is stored securely
                </p>
            </motion.div>
        </div>
    );
}
