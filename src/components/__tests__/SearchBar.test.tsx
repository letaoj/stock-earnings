import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    expect(input).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} placeholder="Search by symbol" />);

    expect(screen.getByPlaceholderText('Search by symbol')).toBeInTheDocument();
  });

  it('should display the current value', () => {
    render(<SearchBar value="AAPL" onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('AAPL');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search stocks...');
    await user.type(input, 'MSFT');

    expect(mockOnChange).toHaveBeenCalledTimes(4); // Once for each character
    // Check that it was called with each character
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 'M');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'S');
    expect(mockOnChange).toHaveBeenNthCalledWith(3, 'F');
    expect(mockOnChange).toHaveBeenNthCalledWith(4, 'T');
  });

  it('should show clear button when value is not empty', () => {
    render(<SearchBar value="AAPL" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onChange with empty string when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="AAPL" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should render search icon', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} />);

    const searchIcon = container.querySelector('.search-icon');
    expect(searchIcon).toBeInTheDocument();
  });
});
