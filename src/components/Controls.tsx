import './Controls.css';

export type SortOption = 'symbol' | 'change' | 'name' | 'timing';
export type FilterOption = 'all' | 'BMO' | 'AMC' | 'released' | 'pending';

interface ControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  // Industry Filter Props
  industries: string[];
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Controls({
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  industries,
  selectedIndustry,
  onIndustryChange,
  onRefresh,
  isRefreshing,
}: ControlsProps) {
  return (
    <div className="controls">
      {/* Industry Filter */}
      <div className="control-group">
        <label htmlFor="industry-select">Industry:</label>
        <select
          id="industry-select"
          value={selectedIndustry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="control-select"
        >
          <option value="all">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="filter-select">Status:</label>
        <select
          id="filter-select"
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          className="control-select"
        >
          <option value="all">All Statuses</option>
          <option value="BMO">Before Market Open</option>
          <option value="AMC">After Market Close</option>
          <option value="released">Released</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="control-select"
        >
          <option value="symbol">Symbol</option>
          <option value="name">Company Name</option>
          <option value="change">Price Change</option>
          <option value="timing">Timing</option>
        </select>
      </div>

      <button
        className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
        onClick={onRefresh} // Ensure refresh is passed correctly
        disabled={isRefreshing}
        aria-label="Refresh data"
      >
        <svg
          className="refresh-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    </div>
  );
}
