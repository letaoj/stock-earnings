import { useRef, useEffect } from 'react';
import { useSettings, TIMEZONES } from '../contexts/SettingsContext';
import './SettingsModal.css';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { timezone, setTimezone } = useSettings();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Handle click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <div className="settings-modal-overlay" onClick={handleBackdropClick}>
            <div className="settings-modal" ref={modalRef}>
                <div className="settings-header">
                    <h2>System Settings</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="settings-body">
                    <div className="setting-group">
                        <label htmlFor="timezone-select">Display Timezone</label>
                        <p className="setting-description">
                            Choose the timezone for displaying earnings times.
                        </p>
                        <select
                            id="timezone-select"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="settings-select"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="primary-button" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
