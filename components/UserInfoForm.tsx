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
                className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-orange-200"
            >
                <h2 className="text-2xl font-bold text-orange-900 mb-2 text-center">வணக்கம் 🙏</h2>
                <p className="text-gray-600 text-center mb-6">
                    உங்களை நன்கு புரிந்து கொள்ள சில தகவல்கள் தேவை
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="inline w-4 h-4 mr-1" />
                            பெயர் (Name)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="உங்கள் பெயர்"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            வயது (Age)
                        </label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="உங்கள் வயது"
                            min="1"
                            max="120"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="inline w-4 h-4 mr-1" />
                            மின்னஞ்சல் (Email)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        தொடங்குவோம் (Let's Begin)
                    </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                    உங்கள் தகவல்கள் பாதுகாப்பாக சேமிக்கப்படும்
                </p>
            </motion.div>
        </div>
    );
}
