import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionDetailModal from '../../app/components/SessionDetailModal'; // Adjust path as needed
import { Session, Speaker, Room } from '../../app/types/schedule'; // Adjust path as needed
import { formatTime, formatDate } from '../../app/utils/dateTime'; // Adjust path as needed

// Mock session data
const mockSession: Session = {
  id: '1',
  title: 'Test Session Title',
  description: 'This is a detailed test session description.',
  slug: 'test-session-title',
  sessionType: 'Workshop',
  trackId: 'track2',
  roomName: 'Room B',
  startsAt: '2024-07-28T14:00:00Z',
  endsAt: '2024-07-28T16:00:00Z',
  speakerIds: ['speaker2'],
  isPlenumSession: false,
  isPublished: true,
  targetAudience: 'All',
  level: 'Beginner',
  status: 'Confirmed',
  // Add any other required fields from the Session type
};

const mockSpeaker: Speaker = {
  id: 'speaker2',
  fullName: 'Jane Doe',
  bio: 'Jane is an expert in testing.',
  tagLine: 'Testing Guru',
  profilePicture: 'https://example.com/jane.jpg',
  sessions: [mockSession.id],
  // Add any other required fields from the Speaker type
};

const mockRoom: Room = {
  id: 'roomB',
  name: 'Room B',
  // Add any other required fields from the Room type
};

// Mock navigator.share and navigator.clipboard.writeText
Object.assign(navigator, {
  share: jest.fn(),
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('SessionDetailModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <SessionDetailModal
        session={mockSession}
        speakers={[mockSpeaker]}
        room={mockRoom}
        isOpen={false}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByText(mockSession.title)).not.toBeInTheDocument();
  });

  it('should render session details when isOpen is true', () => {
    render(
      <SessionDetailModal
        session={mockSession}
        speakers={[mockSpeaker]}
        room={mockRoom}
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText(mockSession.title)).toBeInTheDocument();
    expect(screen.getByText(mockSession.description)).toBeInTheDocument();
    expect(screen.getByText(formatDate(mockSession.startsAt))).toBeInTheDocument();
    // Check for time - formatTime will be called twice, once for start and once for end
    const expectedTimeRange = `${formatTime(mockSession.startsAt)} - ${formatTime(mockSession.endsAt)}`;
    expect(screen.getByText(new RegExp(expectedTimeRange.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument(); // Escape special characters for regex
    expect(screen.getByText(mockSpeaker.fullName)).toBeInTheDocument();
    expect(screen.getByText(mockRoom.name)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <SessionDetailModal
        session={mockSession}
        speakers={[mockSpeaker]}
        room={mockRoom}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // Click the main close button (visible on larger screens)
    // The close button is an SVG, so we need a more robust selector.
    // Let's assume the close button in the header is the primary one.
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]); // Assuming the first button with "close" accessible name is the one in the header
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <SessionDetailModal
        session={mockSession}
        speakers={[mockSpeaker]}
        room={mockRoom}
        isOpen={true}
        onClose={handleClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

    it('should call onBookmarkToggle when bookmark button is clicked', () => {
    const handleBookmarkToggle = jest.fn();
    render(
      <SessionDetailModal
        session={mockSession}
        isOpen={true}
        onClose={jest.fn()}
        onBookmarkToggle={handleBookmarkToggle}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Bookmark/i }));
    expect(handleBookmarkToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onStarToggle when "Mark as Going" button is clicked', () => {
    const handleStarToggle = jest.fn();
    render(
      <SessionDetailModal
        session={mockSession}
        isOpen={true}
        onClose={jest.fn()}
        onStarToggle={handleStarToggle}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Mark as Going/i }));
    expect(handleStarToggle).toHaveBeenCalledTimes(1);
  });

  it('should call navigator.share when share button is clicked and share API is available', async () => {
    const handleShare = jest.fn();
    (navigator.share as jest.Mock).mockImplementationOnce(handleShare);

    render(
      <SessionDetailModal
        session={mockSession}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Share/i }));
    expect(navigator.share).toHaveBeenCalledWith({
        title: mockSession.title,
        text: `Check out this session at AI Engineer World's Fair 2025: ${mockSession.title}`,
        url: `${window.location.origin}/?session=${mockSession.id}`,
    });
  });

  it('should call navigator.clipboard.writeText when share button is clicked and share API is not available', async () => {
    const originalShare = navigator.share;
    (navigator as any).share = undefined; // Temporarily remove navigator.share for this test case
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});


    render(
      <SessionDetailModal
        session={mockSession}
        isOpen={true}
        onClose={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Share/i }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/?session=${mockSession.id}`);
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Link copied to clipboard");
    });

    alertMock.mockRestore();
    (navigator as any).share = originalShare; // Restore original navigator.share
  });
});
