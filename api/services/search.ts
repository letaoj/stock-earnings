interface SearchResult {
    title: string;
    link: string;
    snippet: string;
}

export async function findEarningsReportUrl(symbol: string, quarter: string): Promise<string | null> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.warn('SERPER_API_KEY not configured. Returning mock/null.');
        return null;
    }

    const query = `${symbol} ${quarter} earnings press release investor relations`;

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query })
        });

        if (!response.ok) {
            throw new Error(`Search API error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.organic as SearchResult[];

        if (!results || results.length === 0) return null;

        // Naive heuristic: prefer .pdf or investor relations domains
        // For now, just return the first organic result that looks promising
        const bestMatch = results.find(r =>
            (r.link.includes('investor') || r.link.includes('news') || r.link.includes('press')) &&
            !r.link.includes('seekingalpha') && // Avoid paywalls/aggregators
            !r.link.includes('motleyfool')
        );

        return bestMatch ? bestMatch.link : results[0].link;
    } catch (error) {
        console.error('Search failed:', error);
        return null;
    }
}
