import { render, screen, fireEvent } from '@testing-library/react';
import SessionCard from '../../app/components/SessionCard'; // Adjust path as needed
import { Session } from '../../app/types/schedule'; // Adjust path as needed

// Mock session data
const mockSession: Session = {
  id: '1',
  title: 'Test Session',
  description: 'This is a test session.',
  slug: 'test-session',
  sessionType: 'Talk',
  trackId: 'track1',
  roomName: 'Room A',
  startsAt: '2024-07-27T10:00:00Z',
  endsAt: '2024-07-27T11:00:00Z',
  speakerIds: ['speaker1'],
  isPlenumSession: false,
  isPublished: true,
  targetAudience: 'Developers',
  level: 'Intermediate',
  status: 'Confirmed',
  // Add any other required fields from the Session type
};

describe('SessionCard', () => {
  it('should render session information', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText(mockSession.title)).toBeInTheDocument();
    // Add more assertions for other session details if needed
  });

  it('should call onClick prop when clicked', () => {
    const handleClick = jest.fn();
    render(<SessionCard session={mockSession} onClick={handleClick} />);

    fireEvent.click(screen.getByText(mockSession.title));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onBookmarkToggle when bookmark button is clicked', () => {
    const handleBookmarkToggle = jest.fn();
    render(<SessionCard session={mockSession} onBookmarkToggle={handleBookmarkToggle} isCompactView={true} />);

    // The bookmark button is an SVG inside a button.
    // We'll find it by its aria-label.
    fireEvent.click(screen.getByRole('button', { name: /add bookmark/i }));
    expect(handleBookmarkToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onStarToggle when star button is clicked', () => {
    const handleStarToggle = jest.fn();
    render(<SessionCard session={mockSession} onStarToggle={handleStarToggle} isCompactView={true} />);

    // The star button might also be an SVG.
    // We'll find it by its aria-label. SessionCard uses "Mark as going" or "Not going"
    fireEvent.click(screen.getByRole('button', { name: /mark as going/i }));
    expect(handleStarToggle).toHaveBeenCalledTimes(1);
  });
});
