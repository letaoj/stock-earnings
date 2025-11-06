import { format } from 'date-fns';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
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

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isFuture = selectedDate > new Date();

  return (
    <div className="date-selector">
      <button className="date-nav-btn" onClick={handlePrevDay} aria-label="Previous day">
        ‹
      </button>
      <div className="date-display">
        <div className="date-text">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
        {!isToday && (
          <button className="today-btn" onClick={handleToday}>
            Today
          </button>
        )}
      </div>
      <button
        className="date-nav-btn"
        onClick={handleNextDay}
        disabled={isFuture}
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}
