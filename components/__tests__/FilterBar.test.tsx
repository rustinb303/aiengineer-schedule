import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../../app/components/FilterBar'; // Adjust path

// Mock props
const mockSetSelectedDay = jest.fn();
const mockSetShowBookmarked = jest.fn();
const mockSetShowStarred = jest.fn();
const mockSetViewMode = jest.fn();

const defaultProps = {
  selectedDay: 0, // "All Days"
  setSelectedDay: mockSetSelectedDay,
  showBookmarked: false,
  setShowBookmarked: mockSetShowBookmarked,
  showStarred: false,
  setShowStarred: mockSetShowStarred,
  viewMode: 'list' as 'list' | 'calendar',
  setViewMode: mockSetViewMode,
};

// Helper to easily get day buttons. Note: labels change based on screen size in component.
// We will use short labels for consistency as they are always present in buttons.
const dayButtons = [
  { value: 0, shortLabel: "All" }, // "All Days"
  { value: 3, shortLabel: "June 3" }, // "Tuesday June 3"
  { value: 1, shortLabel: "June 4" }, // "Wednesday June 4"
  { value: 2, shortLabel: "June 5" }, // "Thursday June 5"
];

describe('FilterBar', () => {
  beforeEach(() => {
    // Clear all mock function calls before each test
    mockSetSelectedDay.mockClear();
    mockSetShowBookmarked.mockClear();
    mockSetShowStarred.mockClear();
    mockSetViewMode.mockClear();
  });

  it('should render correctly with initial default props', () => {
    render(<FilterBar {...defaultProps} />);

    // Check view mode buttons
    expect(screen.getByRole('button', { name: /List/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument();

    // Check day filter buttons
    dayButtons.forEach(day => {
      expect(screen.getByRole('button', { name: new RegExp(day.shortLabel, 'i') })).toBeInTheDocument();
    });

    // Check bookmark and starred buttons
    expect(screen.getByRole('button', { name: /Bookmarked/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Going/i })).toBeInTheDocument();

    // Check active states based on default props
    // List view should be active
    expect(screen.getByRole('button', { name: /List/i })).toHaveClass('bg-white'); // Active class
    expect(screen.getByRole('button', { name: /Calendar/i })).not.toHaveClass('bg-white');
    // "All Days" (shortLabel "All") should be active
    expect(screen.getByRole('button', { name: /All/i })).toHaveClass('bg-gray-900'); // Active class for day
    // Bookmark and Starred should not be active
    expect(screen.getByRole('button', { name: /Bookmarked/i })).not.toHaveClass('bg-blue-100');
    expect(screen.getByRole('button', { name: /Going/i })).not.toHaveClass('bg-green-100');
  });

  it('should highlight "Calendar" view and "June 3" when viewMode is calendar and selectedDay is 3', () => {
    render(<FilterBar {...defaultProps} viewMode="calendar" selectedDay={3} />);
    expect(screen.getByRole('button', { name: /Calendar/i })).toHaveClass('bg-white');
    expect(screen.getByRole('button', { name: /List/i })).not.toHaveClass('bg-white');
    expect(screen.getByRole('button', { name: /June 3/i })).toHaveClass('bg-gray-900');
    // "All Days" button is not rendered in calendar view by default in the component
    expect(screen.queryByRole('button', { name: /All/i })).not.toBeInTheDocument();
  });

  it('should call setViewMode when List view button is clicked', () => {
    render(<FilterBar {...defaultProps} viewMode="calendar" />); // Start in calendar
    fireEvent.click(screen.getByRole('button', { name: /List/i }));
    expect(mockSetViewMode).toHaveBeenCalledWith('list');
    expect(mockSetViewMode).toHaveBeenCalledTimes(1);
  });

  it('should call setViewMode when Calendar view button is clicked', () => {
    render(<FilterBar {...defaultProps} viewMode="list" />); // Start in list
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }));
    expect(mockSetViewMode).toHaveBeenCalledWith('calendar');
    expect(mockSetViewMode).toHaveBeenCalledTimes(1);
  });

  it('should call setSelectedDay when a day button is clicked', () => {
    render(<FilterBar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /June 4/i })); // Corresponds to value 1
    expect(mockSetSelectedDay).toHaveBeenCalledWith(1);
    expect(mockSetSelectedDay).toHaveBeenCalledTimes(1);
  });

  it('should call setShowBookmarked when Bookmarked button is clicked', () => {
    const { rerender } = render(<FilterBar {...defaultProps} showBookmarked={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Bookmarked/i }));
    expect(mockSetShowBookmarked).toHaveBeenCalledWith(true);

    mockSetShowBookmarked.mockClear(); // Clear mock before next action
    rerender(<FilterBar {...defaultProps} showBookmarked={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Bookmarked/i }));
    expect(mockSetShowBookmarked).toHaveBeenCalledWith(false);
    expect(mockSetShowBookmarked).toHaveBeenCalledTimes(1); // Ensure it's called once for this part
  });

  it('should call setShowStarred when Going button is clicked', () => {
    const { rerender } = render(<FilterBar {...defaultProps} showStarred={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Going/i }));
    expect(mockSetShowStarred).toHaveBeenCalledWith(true);

    mockSetShowStarred.mockClear(); // Clear mock before next action
    rerender(<FilterBar {...defaultProps} showStarred={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Going/i }));
    expect(mockSetShowStarred).toHaveBeenCalledWith(false);
    expect(mockSetShowStarred).toHaveBeenCalledTimes(1); // Ensure it's called once for this part
  });

  describe('useEffect for viewMode and selectedDay', () => {
    it('should call setSelectedDay(3) if viewMode changes to "calendar" and selectedDay is 0', () => {
      const { rerender } = render(<FilterBar {...defaultProps} selectedDay={0} viewMode="list" />);
      // Change viewMode to calendar, selectedDay is already 0
      rerender(<FilterBar {...defaultProps} selectedDay={0} viewMode="calendar" />);
      expect(mockSetSelectedDay).toHaveBeenCalledWith(3); // Should default to Tuesday (value 3)
      expect(mockSetSelectedDay).toHaveBeenCalledTimes(1);
    });

    it('should not call setSelectedDay if viewMode changes to "calendar" but selectedDay is not 0', () => {
      const { rerender } = render(<FilterBar {...defaultProps} selectedDay={1} viewMode="list" />);
      rerender(<FilterBar {...defaultProps} selectedDay={1} viewMode="calendar" />);
      expect(mockSetSelectedDay).not.toHaveBeenCalled();
    });

    it('should not call setSelectedDay if viewMode is "list"', () => {
      const { rerender } = render(<FilterBar {...defaultProps} selectedDay={0} viewMode="calendar" />);
      // The above render might call setSelectedDay due to the useEffect. Clear it before the action we are testing.
      mockSetSelectedDay.mockClear();

      // Change viewMode to list, selectedDay is 0
      rerender(<FilterBar {...defaultProps} selectedDay={0} viewMode="list" />);
      expect(mockSetSelectedDay).not.toHaveBeenCalled();
    });
  });
});
