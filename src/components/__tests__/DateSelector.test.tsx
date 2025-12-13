import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateSelector } from '../DateSelector';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('DateSelector', () => {
  const mockDate = new Date('2024-01-15');
  const mockOnDateChange = vi.fn();

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <SettingsProvider>
        {ui}
      </SettingsProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the selected date', () => {
    renderWithProviders(<DateSelector selectedDate={mockDate} onDateChange={mockOnDateChange} />);

    expect(screen.getByText(/January.*2024/)).toBeInTheDocument();
  });

  it('should call onDateChange with previous day when prev button clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DateSelector selectedDate={mockDate} onDateChange={mockOnDateChange} />);

    const prevButton = screen.getByLabelText('Previous day');
    await user.click(prevButton);

    expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    const calledDate = mockOnDateChange.mock.calls[0][0];
    // Should be one day before the mock date
    expect(calledDate.getTime()).toBeLessThan(mockDate.getTime());
  });

  it('should call onDateChange with next day when next button clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DateSelector selectedDate={mockDate} onDateChange={mockOnDateChange} />);

    const nextButton = screen.getByLabelText('Next day');
    await user.click(nextButton);

    expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    const calledDate = mockOnDateChange.mock.calls[0][0];
    // Should be one day after the mock date
    expect(calledDate.getTime()).toBeGreaterThan(mockDate.getTime());
  });

  it('should show Today button when not viewing today', () => {
    renderWithProviders(<DateSelector selectedDate={mockDate} onDateChange={mockOnDateChange} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('should not show Today button when viewing today', () => {
    const today = new Date();
    renderWithProviders(<DateSelector selectedDate={today} onDateChange={mockOnDateChange} />);

    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('should call onDateChange with current date when Today button clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DateSelector selectedDate={mockDate} onDateChange={mockOnDateChange} />);

    const todayButton = screen.getByText('Today');
    await user.click(todayButton);

    expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    const calledDate = mockOnDateChange.mock.calls[0][0];
    const today = new Date();
    expect(calledDate.toDateString()).toBe(today.toDateString());
  });

  it('should disable next button for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    renderWithProviders(<DateSelector selectedDate={tomorrow} onDateChange={mockOnDateChange} />);

    const nextButton = screen.getByLabelText('Next day');
    expect(nextButton).toBeDisabled();
  });

  it('should not disable next button for past dates', () => {
    render(<DateSelector selectedDate={mockDate} onDateChange={mockOnDateChange} />);

    const nextButton = screen.getByLabelText('Next day');
    expect(nextButton).not.toBeDisabled();
  });
});
