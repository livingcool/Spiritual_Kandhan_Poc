'use client';

import React, { useState, useEffect } from 'react';

export default function TokenStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tokens')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch stats:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <p className="text-orange-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-orange-900 mb-8">Token Usage Statistics</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                        <p className="text-gray-600 text-sm">Total Tokens</p>
                        <p className="text-3xl font-bold text-orange-900">{stats?.totalTokens?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
                        <p className="text-gray-600 text-sm">Total Requests</p>
                        <p className="text-3xl font-bold text-amber-900">{stats?.requestCount?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <p className="text-gray-600 text-sm">Avg Tokens/Request</p>
                        <p className="text-3xl font-bold text-yellow-900">
                            {stats?.requestCount ? Math.round(stats.totalTokens / stats.requestCount) : 0}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Breakdown</h2>
                    <div className="space-y-3">
                        {stats?.dailyStats?.map((day: any) => (
                            <div key={day.date} className="border-b pb-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{day.date}</span>
                                    <span className="text-orange-600 font-semibold">{day.totalTokens.toLocaleString()} tokens</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {day.requests} requests • Avg: {Math.round(day.totalTokens / day.requests)} tokens/req
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a href="/" className="text-orange-600 hover:text-orange-700 underline">
                        ← Back to Chat
                    </a>
                </div>
            </div>
        </div>
    );
}
