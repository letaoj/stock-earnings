import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from '../Controls';

describe('Controls', () => {
  const mockProps = {
    sortBy: 'symbol' as const,
    onSortChange: vi.fn(),
    filterBy: 'all' as const,
    onFilterChange: vi.fn(),
    onRefresh: vi.fn(),
    isRefreshing: false,
    industries: ['Technology', 'Finance'],
    selectedIndustry: 'all',
    onIndustryChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render filter and sort selects', () => {
    render(<Controls {...mockProps} />);

    expect(screen.getByLabelText('Status:')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    render(<Controls {...mockProps} />);

    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('should call onSortChange when sort option changes', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);

    const sortSelect = screen.getByLabelText('Sort by:');
    await user.selectOptions(sortSelect, 'change');

    expect(mockProps.onSortChange).toHaveBeenCalledWith('change');
  });

  it('should call onFilterChange when filter option changes', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);

    const filterSelect = screen.getByLabelText('Status:');
    await user.selectOptions(filterSelect, 'BMO');

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('BMO');
  });

  it('should call onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<Controls {...mockProps} />);

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    expect(mockProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button when refreshing', () => {
    render(<Controls {...mockProps} isRefreshing={true} />);

    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeDisabled();
  });

  it('should add refreshing class when refreshing', () => {
    render(<Controls {...mockProps} isRefreshing={true} />);

    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toHaveClass('refreshing');
  });

  it('should show all filter options', () => {
    render(<Controls {...mockProps} />);

    const filterSelect = screen.getByLabelText('Status:');
    expect(filterSelect).toContainHTML('<option value="all">All Statuses</option>');
    expect(filterSelect).toContainHTML('<option value="BMO">Before Market Open</option>');
    expect(filterSelect).toContainHTML('<option value="AMC">After Market Close</option>');
    expect(filterSelect).toContainHTML('<option value="released">Released</option>');
    expect(filterSelect).toContainHTML('<option value="pending">Pending</option>');
  });

  it('should show all sort options', () => {
    render(<Controls {...mockProps} />);

    const sortSelect = screen.getByLabelText('Sort by:');
    expect(sortSelect).toContainHTML('<option value="symbol">Symbol</option>');
    expect(sortSelect).toContainHTML('<option value="name">Company Name</option>');
    expect(sortSelect).toContainHTML('<option value="change">Price Change</option>');
    expect(sortSelect).toContainHTML('<option value="timing">Timing</option>');
  });

  it('should reflect current sort value', () => {
    render(<Controls {...mockProps} sortBy="change" />);

    const sortSelect = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(sortSelect.value).toBe('change');
  });

  it('should reflect current filter value', () => {
    render(<Controls {...mockProps} filterBy="BMO" />);

    const filterSelect = screen.getByLabelText('Status:') as HTMLSelectElement;
    expect(filterSelect.value).toBe('BMO');
  });
});
