import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported timezones
export const TIMEZONES = [
    { value: 'local', label: 'Local Time' },
    { value: 'America/New_York', label: 'US Eastern (New York)' },
    { value: 'America/Chicago', label: 'US Central (Chicago)' },
    { value: 'America/Denver', label: 'US Mountain (Denver)' },
    { value: 'America/Los_Angeles', label: 'US Pacific (Los Angeles)' },
    { value: 'Europe/London', label: 'London (UTC/BST)' },
    { value: 'UTC', label: 'UTC' },
];

interface SettingsContextType {
    timezone: string;
    setTimezone: (tz: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [timezone, setTimezone] = useState<string>(() => {
        // Check localStorage first
        const saved = localStorage.getItem('stock-earnings-timezone');
        // Default to 'America/New_York' if nothing saved, as this is a US-centric tool
        return saved || 'America/New_York';
    });

    useEffect(() => {
        localStorage.setItem('stock-earnings-timezone', timezone);
    }, [timezone]);

    return (
        <SettingsContext.Provider value={{ timezone, setTimezone }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
