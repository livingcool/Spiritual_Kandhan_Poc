import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const conversationLogsDir = path.join(process.cwd(), 'conversation_logs');
        const tokenLogsDir = path.join(process.cwd(), 'token_logs');

        const exportData: any = {
            exportDate: new Date().toISOString(),
            metadata: {
                platform: 'Kandhan Karunai',
                version: '1.0.0',
                purpose: 'Model Training Data Export',
            },
            conversations: [],
            tokenUsage: {
                summary: {
                    totalTokens: 0,
                    totalPromptTokens: 0,
                    totalCandidatesTokens: 0,
                    totalRequests: 0,
                },
                detailed: [],
            },
        };

        // Read conversation logs
        if (fs.existsSync(conversationLogsDir)) {
            const conversationFiles = fs.readdirSync(conversationLogsDir).filter(f => f.endsWith('.jsonl'));

            conversationFiles.forEach(file => {
                const filePath = path.join(conversationLogsDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.trim().split('\n').filter(l => l);

                lines.forEach(line => {
                    try {
                        const entry = JSON.parse(line);
                        exportData.conversations.push({
                            date: file.replace('conversations_', '').replace('.jsonl', ''),
                            ...entry,
                        });
                    } catch (e) {
                        // Skip invalid lines
                    }
                });
            });
        }

        // Read token logs
        if (fs.existsSync(tokenLogsDir)) {
            const tokenFiles = fs.readdirSync(tokenLogsDir).filter(f => f.endsWith('.jsonl'));

            tokenFiles.forEach(file => {
                const filePath = path.join(tokenLogsDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.trim().split('\n').filter(l => l);

                lines.forEach(line => {
                    try {
                        const entry = JSON.parse(line);
                        exportData.tokenUsage.detailed.push({
                            date: file.replace('tokens_', '').replace('.jsonl', ''),
                            ...entry,
                        });

                        // Update summary
                        exportData.tokenUsage.summary.totalTokens += entry.totalTokens || 0;
                        exportData.tokenUsage.summary.totalPromptTokens += entry.promptTokens || 0;
                        exportData.tokenUsage.summary.totalCandidatesTokens += entry.candidatesTokens || 0;
                        exportData.tokenUsage.summary.totalRequests++;
                    } catch (e) {
                        // Skip invalid lines
                    }
                });
            });
        }

        // Add statistics
        exportData.statistics = {
            totalConversations: exportData.conversations.length,
            totalTokenRequests: exportData.tokenUsage.summary.totalRequests,
            averageTokensPerRequest: exportData.tokenUsage.summary.totalRequests > 0
                ? Math.round(exportData.tokenUsage.summary.totalTokens / exportData.tokenUsage.summary.totalRequests)
                : 0,
        };

        // Return as downloadable JSON file
        const filename = `kandhan-karunai-training-data-${new Date().toISOString().split('T')[0]}.json`;

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error: any) {
        console.error('Error exporting data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to export data' },
            { status: 500 }
        );
    }
}
