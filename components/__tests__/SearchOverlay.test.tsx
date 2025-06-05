import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SearchOverlay from '../../app/components/SearchOverlay'; // Adjust path as needed
import { Session, Speaker, Room } from '../../app/types/schedule'; // Adjust path as needed

// Mock data
const mockSpeakersList: Speaker[] = [
  { id: 'sp1', fullName: 'John Doe', bio: 'Tech lead', tagLine: 'Expert', profilePicture: '', sessions: ['s1', 's3'] },
  { id: 'sp2', fullName: 'Jane Smith', bio: 'Developer', tagLine: 'Creator', profilePicture: '', sessions: ['s2'] },
  { id: 'sp3', fullName: 'Alex Query', bio: 'Data Scientist', tagLine: 'Numbers guy', profilePicture: '', sessions: [] },
];

const mockRoomsList: Room[] = [
  { id: 'r1', name: 'Room A' },
  { id: 'r2', name: 'Room B' },
  { id: 'r3', name: 'Main Hall' },
];

const mockSessionsList: Session[] = [
  { id: 's1', title: 'Amazing AI Talk', description: 'A talk about artificial intelligence by John.', slug: 'amazing-ai-talk', sessionType: 'Talk', trackId: 't1', roomId: 'r1', startsAt: '2024-07-27T10:00:00Z', endsAt: '2024-07-27T11:00:00Z', speakerIds: ['sp1'], isPlenumSession: false, isPublished: true, targetAudience: 'All', level: 'Beginner', status: 'Confirmed' },
  { id: 's2', title: 'Deep Learning Workshop', description: 'Hands-on deep learning with Jane.', slug: 'deep-learning-workshop', sessionType: 'Workshop', trackId: 't2', roomId: 'r2', startsAt: '2024-07-27T14:00:00Z', endsAt: '2024-07-27T16:00:00Z', speakerIds: ['sp2'], isPlenumSession: false, isPublished: true, targetAudience: 'Developers', level: 'Intermediate', status: 'Confirmed' },
  { id: 's3', title: 'Future of Development', description: 'John discusses future trends in software.', slug: 'future-dev', sessionType: 'Keynote', trackId: 't1', roomId: 'r3', startsAt: '2024-07-28T09:00:00Z', endsAt: '2024-07-28T10:00:00Z', speakerIds: ['sp1'], isPlenumSession: true, isPublished: true, targetAudience: 'All', level: 'Advanced', status: 'Confirmed' },
  { id: 's4', title: 'Another Talk', description: 'A generic session.', slug: 'another-talk', sessionType: 'Talk', trackId: 't3', roomId: 'r1', startsAt: '2024-07-28T11:00:00Z', endsAt: '2024-07-28T12:00:00Z', speakerIds: ['sp3'], isPlenumSession: false, isPublished: true, targetAudience: 'All', level: 'Beginner', status: 'Confirmed' },
];

const mockOnClose = jest.fn();
const mockOnSessionClick = jest.fn();

const defaultTestProps = {
  isOpen: true,
  onClose: mockOnClose,
  sessions: mockSessionsList,
  speakers: mockSpeakersList,
  rooms: mockRoomsList,
  onSessionClick: mockOnSessionClick,
};

describe('SearchOverlay', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSessionClick.mockClear();
    jest.useFakeTimers(); // Use fake timers for debounce testing
  });

  afterEach(() => {
    // Ensure all timers are flushed within an act() block
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers(); // Restore real timers
  });

  it('should render correctly when isOpen is true', () => {
    render(<SearchOverlay {...defaultTestProps} />);
    expect(screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i)).toBeInTheDocument();
    expect(screen.getByText(/Start typing to search sessions/i)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<SearchOverlay {...defaultTestProps} isOpen={false} />);
    expect(screen.queryByPlaceholderText(/Search sessions, speakers, descriptions.../i)).not.toBeInTheDocument();
  });

  it('should update search term as user types and show "Searching..." message', () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);

    fireEvent.change(searchInput, { target: { value: 'AI' } });
    expect((searchInput as HTMLInputElement).value).toBe('AI');
    // "Searching..." should appear because debouncedSearchTerm hasn't updated yet
    expect(screen.getByText(/Searching.../i)).toBeInTheDocument();
  });

  it('should debounce search term and display results', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);

    fireEvent.change(searchInput, { target: { value: 'AI' } });
    expect((searchInput as HTMLInputElement).value).toBe('AI');

    act(() => {
      jest.advanceTimersByTime(150); // Advance timer past debounce period (100ms)
    });

    // Now results should be based on "AI"
    // Session s1 has "AI" in title and "artificial intelligence" in description
    await waitFor(() => {
      // Find by role 'heading' then check textContent
      const heading = screen.getByRole('heading', { name: /Amazing AI Talk/i });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toBe('Amazing AI Talk');
    });
    // Check for highlighted mark
    const headingWithMark = screen.getByRole('heading', { name: /Amazing AI Talk/i });
    const markElement = headingWithMark.querySelector('mark');
    expect(markElement).toBeInTheDocument();
    expect(markElement).toHaveTextContent('AI');
  });

  it('should filter sessions by title', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'Workshop' } });
    act(() => { jest.advanceTimersByTime(150); });

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /Deep Learning Workshop/i });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toBe('Deep Learning Workshop');
      expect(screen.queryByRole('heading', { name: /Amazing AI Talk/i })).not.toBeInTheDocument();
    });
  });

  it('should filter sessions by description', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'hands-on' } }); // in s2 description
    act(() => { jest.advanceTimersByTime(150); });

    await waitFor(() => {
      expect(screen.getByText(/Deep Learning Workshop/i)).toBeInTheDocument();
      expect(screen.queryByText(/Amazing AI Talk/i)).not.toBeInTheDocument();
    });
  });

  it('should filter sessions by speaker name', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'Jane Smith' } });
    act(() => { jest.advanceTimersByTime(150); });

    await waitFor(() => {
      // s2 is by Jane Smith
      expect(screen.getByText(/Deep Learning Workshop/i)).toBeInTheDocument();
      // s1 and s3 are by John Doe
      expect(screen.queryByText(/Amazing AI Talk/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Future of Development/i)).not.toBeInTheDocument();
    });
  });

  it('should be case-insensitive', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'amazing ai' } }); // lowercase
    act(() => { jest.advanceTimersByTime(150); });

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /Amazing AI Talk/i });
      expect(heading).toBeInTheDocument();
      // For case-insensitive, the actual text content might differ in casing from the search term
      expect(heading.textContent?.toLowerCase()).toBe('amazing ai talk');
    });
  });

  it('should show "No results found" message for non-matching term', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentTermXYZ' } });
    act(() => { jest.advanceTimersByTime(150); });

    await waitFor(() => {
      expect(screen.getByText(/No results found for "NonExistentTermXYZ"/i)).toBeInTheDocument();
    });
  });

  it('should not search if term length is less than 2 characters', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'A' } }); // Single character
    act(() => { jest.advanceTimersByTime(150); });

    // Should still show "Start typing..." or be empty of results, not "No results" or actual results
    await waitFor(() => {
        // The component shows "Start typing..." if debouncedSearchTerm is empty OR length < 2
        // and if searchTerm is also empty. If searchTerm is 'A', it shows "Searching..."
        // then if debouncedSearchTerm becomes 'A', it should effectively show no results
        // or a message indicating more characters are needed.
        // The current component logic means it will return [] from searchResults,
        // and if searchTerm is 'A', it will show "No results found for 'A'".
        // This might be desired, or it might be better to show "Please enter at least 2 characters".
        // For now, testing current behavior.
        expect(screen.getByText(/No results found for "A"/i)).toBeInTheDocument();
    });
  });

  it('should call onSessionClick and onClose when a result is clicked', async () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'Workshop' } }); // s2
    act(() => { jest.advanceTimersByTime(150); });

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /Deep Learning Workshop/i });
      expect(heading).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('heading', { name: /Deep Learning Workshop/i }));
    expect(mockOnSessionClick).toHaveBeenCalledWith(mockSessionsList.find(s => s.id === 's2'));
    expect(mockOnSessionClick).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose and clear search when backdrop is clicked', () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Backdrop is the div with class "absolute inset-0 bg-black/50 backdrop-blur-sm"
    // It's the parent of the search panel but covers the screen.
    // We can get it by finding the parent of the search input and then its sibling/or parent that acts as backdrop.
    // Or, more simply, the first div child of the outermost div.
    const backdrop = document.querySelector('.fixed.inset-0 > div:first-child');
    expect(backdrop).not.toBeNull();
    if (backdrop) fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect((searchInput as HTMLInputElement).value).toBe(''); // Search term should be cleared
  });

  it('should call onClose and clear search when explicit close button is clicked', () => {
    render(<SearchOverlay {...defaultTestProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sessions, speakers, descriptions.../i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // The close button is inside the header, next to the input
    const closeButton = screen.getByRole('button', { name: '' }); // It's an SVG without explicit name, find generically
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect((searchInput as HTMLInputElement).value).toBe(''); // Search term should be cleared
  });
});
