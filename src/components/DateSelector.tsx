import { format } from 'date-fns';
import './DateSelector.css';
import { useSettings } from '../contexts/SettingsContext';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const { timezone } = useSettings();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone === 'local' ? undefined : timezone,
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const isToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="date-selector">
      <button onClick={handlePrevDay} className="nav-button" aria-label="Previous day">
        ←
      </button>

      <div className="date-display">
        <span className="current-date">{formatDate(selectedDate)}</span>
        {!isToday && (
          <button className="today-btn" onClick={handleToday}>
            Today
          </button>
        )}
        <input
          type="date"
          className="date-input"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          aria-label="Select date"
        />
      </div>

      <button
        onClick={handleNextDay}
        className="nav-button"
        disabled={selectedDate > new Date(new Date().setFullYear(new Date().getFullYear() + 1))} // 1 year limit
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}
