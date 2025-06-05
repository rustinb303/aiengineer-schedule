import { render, screen, fireEvent } from '@testing-library/react';
import SessionCard from '../../app/components/SessionCard'; // Adjust path as needed
import { Session, Room } from '../../app/types/schedule'; // Adjust path as needed

// Mock session data
const mockSession: Session = {
  id: '1',
  title: 'Test Session',
  description: 'This is a test session.',
  slug: 'test-session',
  sessionType: 'Talk',
  trackId: 'track1',
  // roomName: 'Room A', // roomName is not directly on Session, will pass Room object
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

const mockSpeaker: Speaker = {
  id: 'speaker1',
  fullName: 'Test Speaker',
  bio: 'Bio of Test Speaker',
  tagLine: 'Tagline of Test Speaker',
  profilePicture: 'https://example.com/speaker.jpg',
  sessions: [mockSession.id],
  // Add any other required fields from the Speaker type
};

const mockRoom: Room = {
  id: 'room1',
  name: 'Room A',
  capacity: 100,
};

describe('SessionCard', () => {
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock window.open before each test
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    // Restore the mock after each test
    windowOpenSpy.mockRestore();
  });

  it('should render session information', () => {
    render(<SessionCard session={mockSession} room={mockRoom} />);

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

  describe('Add to Google Calendar button', () => {
    const expectedFormattedStartDate = '20240727T100000Z';
    const expectedFormattedEndDate = '20240727T110000Z';

    it('should render in non-compact view and generate correct Google Calendar link', () => {
      render(
        <SessionCard
          session={mockSession}
          room={mockRoom}
          speaker={mockSpeaker} // Added speaker
          isCompactView={false}
        />
      );

      const calendarButton = screen.getByRole('button', {
        name: /add to google calendar/i,
      });
      expect(calendarButton).toBeInTheDocument();

      fireEvent.click(calendarButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const openedUrl = windowOpenSpy.mock.calls[0][0];

      expect(openedUrl).toContain(
        'https://www.google.com/calendar/render?action=TEMPLATE'
      );
      // URLSearchParams encodes space as '+'
      expect(openedUrl).toContain(`text=${mockSession.title.replace(/ /g, "+")}`);
      expect(openedUrl).toContain(
        `details=${mockSession.description!.replace(/ /g, "+")}`
      );
      expect(openedUrl).toContain(
        `dates=${expectedFormattedStartDate}%2F${expectedFormattedEndDate}`
      );
      expect(openedUrl).toContain(`location=${mockRoom.name.replace(/ /g, "+")}`);
    });

    it('should render in compact view and generate correct Google Calendar link', () => {
      render(
        <SessionCard
          session={mockSession}
          room={mockRoom}
          speaker={mockSpeaker} // Added speaker (though compact view might not depend on it for this button)
          isCompactView={true}
        />
      );

      const calendarButton = screen.getByRole('button', {
        name: /add to google calendar/i,
      });
      expect(calendarButton).toBeInTheDocument();

      fireEvent.click(calendarButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const openedUrl = windowOpenSpy.mock.calls[0][0];

      expect(openedUrl).toContain(
        'https://www.google.com/calendar/render?action=TEMPLATE'
      );
      // URLSearchParams encodes space as '+'
      expect(openedUrl).toContain(`text=${mockSession.title.replace(/ /g, "+")}`);
      expect(openedUrl).toContain(
        `details=${mockSession.description!.replace(/ /g, "+")}`
      );
      expect(openedUrl).toContain(
        `dates=${expectedFormattedStartDate}%2F${expectedFormattedEndDate}`
      );
      expect(openedUrl).toContain(`location=${mockRoom.name.replace(/ /g, "+")}`);
    });

    it('should generate Google Calendar link without location if room is not provided', () => {
      render(
        <SessionCard
          session={mockSession} // room prop not passed
          speaker={mockSpeaker} // Added speaker
          isCompactView={false}
        />
      );
      const calendarButton = screen.getByRole('button', { name: /add to google calendar/i });
      fireEvent.click(calendarButton);
      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const openedUrl = windowOpenSpy.mock.calls[0][0];
      expect(openedUrl).not.toContain('location=');
    });

    it('should use empty string for description if session.description is null or undefined', () => {
      const sessionWithoutDescription = { ...mockSession, description: undefined };
      render(
        <SessionCard
          session={sessionWithoutDescription}
          room={mockRoom}
          speaker={mockSpeaker} // Added speaker
          isCompactView={false}
        />
      );
      const calendarButton = screen.getByRole('button', { name: /add to google calendar/i });
      fireEvent.click(calendarButton);
      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const openedUrl = windowOpenSpy.mock.calls[0][0];
      expect(openedUrl).toContain('details='); // Empty description
      expect(openedUrl).not.toContain('details=undefined');
    });

  });
});
