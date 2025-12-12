import { VercelRequest, VercelResponse } from '@vercel/node';

const CSV_URL = 'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch(CSV_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch S&P 500 data: ${response.status}`);
        }

        const text = await response.text();

        // Parse CSV: First column is Symbol
        const lines = text.split('\n');
        const symbols = lines
            .slice(1) // Skip header
            .map(line => {
                // Handle variations in CSV line endings and potentially quoted fields
                const columns = line.split(',');
                return columns[0]?.trim();
            })
            .filter(symbol => symbol && symbol.length > 0); // Remove empty/invalid

        // Cache for 24 hours (86400 seconds) since S&P 500 list changes rarely
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

        return res.status(200).json(symbols);
    } catch (error) {
        console.error('S&P 500 API error:', error);
        return res.status(500).json({
            error: 'Failed to fetch S&P 500 list',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
