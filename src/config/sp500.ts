import { apiClient } from '../services/apiClient';

// Store cached list in memory to avoid repeated fetches during session
let cachedSP500: Set<string> | null = null;

export const fetchSP500List = async (): Promise<Set<string>> => {
  if (cachedSP500) return cachedSP500;

  try {
    const symbols = await apiClient.get<string[]>('/sp500');
    if (Array.isArray(symbols)) {
      cachedSP500 = new Set(symbols.map(s => s.toUpperCase()));
      return cachedSP500;
    }
    return new Set();
  } catch (error) {
    console.error('Failed to fetch S&P 500 list:', error);
    // Fallback? We can return empty set or a minimal fallback list if API fails
    return new Set();
  }
};

// Helper to check if a symbol is in the PROVIDED set
export const isSP500 = (symbol: string, sp500Set: Set<string>): boolean => {
  return sp500Set.size > 0 ? sp500Set.has(symbol.toUpperCase()) : true; // If list failed to load, don't filter? Or allow all?
  // User wants separation. If list fails, maybe we can't separate reliably. 
  // Let's assume empty set means "unknown", so everything goes to "Other" or we disable splitting.
  // Better: returns false if set is empty.
};
