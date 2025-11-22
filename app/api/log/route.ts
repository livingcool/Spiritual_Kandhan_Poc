import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userMessage, modelResponse, timestamp } = body;

        // Create logs directory if it doesn't exist
        const logsDir = path.join(process.cwd(), 'conversation_logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Create log entry
        const logEntry = {
            timestamp: timestamp || new Date().toISOString(),
            userMessage,
            modelResponse,
        };

        // Append to daily log file
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `conversations_${date}.jsonl`);

        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error logging conversation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to log conversation' },
            { status: 500 }
        );
    }
}
