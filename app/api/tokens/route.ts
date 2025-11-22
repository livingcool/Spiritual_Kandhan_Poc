import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const logsDir = path.join(process.cwd(), 'token_logs');

        if (!fs.existsSync(logsDir)) {
            return NextResponse.json({
                totalTokens: 0,
                totalPromptTokens: 0,
                totalCandidatesTokens: 0,
                requestCount: 0,
                dailyStats: [],
            });
        }

        const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));

        let totalTokens = 0;
        let totalPromptTokens = 0;
        let totalCandidatesTokens = 0;
        let requestCount = 0;
        const dailyStats: any[] = [];

        files.forEach(file => {
            const filePath = path.join(logsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.trim().split('\n').filter(l => l);

            let dayTotal = 0;
            let dayPrompt = 0;
            let dayCandidates = 0;
            let dayRequests = 0;

            lines.forEach(line => {
                try {
                    const entry = JSON.parse(line);
                    totalTokens += entry.totalTokens || 0;
                    totalPromptTokens += entry.promptTokens || 0;
                    totalCandidatesTokens += entry.candidatesTokens || 0;
                    requestCount++;

                    dayTotal += entry.totalTokens || 0;
                    dayPrompt += entry.promptTokens || 0;
                    dayCandidates += entry.candidatesTokens || 0;
                    dayRequests++;
                } catch (e) {
                    // Skip invalid lines
                }
            });

            dailyStats.push({
                date: file.replace('tokens_', '').replace('.jsonl', ''),
                totalTokens: dayTotal,
                promptTokens: dayPrompt,
                candidatesTokens: dayCandidates,
                requests: dayRequests,
            });
        });

        return NextResponse.json({
            totalTokens,
            totalPromptTokens,
            totalCandidatesTokens,
            requestCount,
            dailyStats: dailyStats.sort((a, b) => b.date.localeCompare(a.date)),
        });
    } catch (error: any) {
        console.error('Error fetching token stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch token stats' },
            { status: 500 }
        );
    }
}
