import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateEarningsAnalysis, AnalysisResult } from './services/gemini';
import { findEarningsReportUrl } from './services/search';

// Simple HTML tag stripper for now, or use cheerio if installed
function extractTextFromHtml(html: string): string {
    return html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { symbol } = req.body;

    if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
    }

    // Determine current/recent quarter
    // This logic can be improved to be dynamic based on date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let quarter = '';
    // Rough approximation of generic earnings season
    if (month < 3) quarter = 'Q4 ' + (year - 1);
    else if (month < 6) quarter = 'Q1 ' + year;
    else if (month < 9) quarter = 'Q2 ' + year;
    else quarter = 'Q3 ' + year;

    try {
        // 1. Find URL
        console.log(`Searching for report: ${symbol} ${quarter}`);
        let reportUrl = await findEarningsReportUrl(symbol, quarter);

        if (!reportUrl) {
            // Fallback logic or error
            console.log('No report URL found via search.');
            // Check if mock is allowed?
            if (process.env.VITE_USE_MOCK_DATA !== 'false') {
                return res.status(200).json({
                    summary: "This is a MOCK summary. The system could not find a live report URL or API keys are missing.",
                    sentiment: "neutral",
                    keyTakeaways: ["Mock Data Point 1", "Mock Data Point 2", "Mock Data Point 3"],
                    reportUrl: "https://example.com/mock-report"
                });
            }
            return res.status(404).json({ error: `Could not find earnings report for ${symbol} ${quarter}` });
        }

        console.log(`Found URL: ${reportUrl}`);

        // 2. Download Content
        // Note: Parsing PDF in Vercel Function might require 'pdf-parse' which adds binary size.
        // For now, let's assume we land on an HTML page or try to fetch text.
        const contentRes = await fetch(reportUrl);
        if (!contentRes.ok) {
            throw new Error(`Failed to download report: ${contentRes.status}`);
        }

        const contentType = contentRes.headers.get('content-type') || '';
        let textContent = '';

        if (contentType.includes('application/pdf') || reportUrl.endsWith('.pdf')) {
            // PDF handling is complex in serverless without heavy libs.
            // For MVP, we might skip parsing PDF or try to use an API that parses it.
            // Or instruct user we can't parse PDF yet.
            // Let's return error for PDF for now unless we add pdf-parse.
            return res.status(415).json({ error: "PDF parsing not yet implemented regarding serverless constraints. Please look for HTML press release." });
            // Ideally we would use `pdf-parse` here.
        } else {
            const html = await contentRes.text();
            textContent = extractTextFromHtml(html);
        }

        if (textContent.length < 500) {
            return res.status(422).json({ error: "Downloaded content seems too short or invalid." });
        }

        // 3. Analyze with Gemini
        const analysis = await generateEarningsAnalysis(textContent, symbol);

        // 4. Return result
        return res.status(200).json({
            ...analysis,
            reportUrl,
            quarter
        });

    } catch (error) {
        console.error('Analysis failed:', error);
        return res.status(500).json({
            error: 'Failed to analyze earnings',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
