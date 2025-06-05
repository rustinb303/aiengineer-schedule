import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionCard from './SessionCard';
import { Session, Room, Speaker } from '../types/schedule'; // Assuming types are here
import * as dateTimeUtils from '../utils/dateTime'; // To mock formatToGoogleCalendarDate

// Mock the next/image component if it's used internally for speaker images or else
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// Mock window.open
const mockWindowOpen = jest.fn();
global.open = mockWindowOpen;

// Mock the dateTime utility function
jest.mock('../utils/dateTime', () => ({
  ...jest.requireActual('../utils/dateTime'), // Import and retain default behavior
  formatToGoogleCalendarDate: jest.fn(),
}));

const mockSession: Session = {
  id: 's1',
  title: 'Test Session Title',
  description: 'This is a test description with special chars like < & >.',
  startsAt: '2024-07-20T10:00:00Z',
  endsAt: '2024-07-20T11:00:00Z',
  isServiceSession: false,
  isPlenumSession: false,
  speakers: [{ id: 'sp1', name: 'Speaker One' }],
  categoryItems: [],
  questionAnswers: [],
  liveUrl: '',
  recordingUrl: '',
  status: '',
  roomId: 'r1',
  level: 'Intermediate',
  scope: 'Technical',
  assignedTrack: 'Track A',
  companies: 'TestCo',
};

const mockRoom: Room = {
  id: 'r1',
  name: 'Test Room A',
  sort: 1,
  sessions: [],
};

const mockSpeaker: Speaker = {
    id: 'sp1',
    username: 'speakerone',
    bio: 'Bio for speaker one',
    firstName: 'Speaker',
    lastName: 'One',
    fullName: 'Speaker One',
    profilePicture: 'https://example.com/speaker.jpg',
    sessions: [],
    tagLine: 'Expert in Testing',
    isTopSpeaker: false,
    links: [],
    questionAnswers: [],
    categories: [],
};


describe('SessionCard - Add to Google Calendar Button', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockWindowOpen.mockClear();
    (dateTimeUtils.formatToGoogleCalendarDate as jest.Mock)
      .mockImplementation((dateString: string) => {
        // Simplified mock for testing structure, real one is more complex
        if (dateString === '2024-07-20T10:00:00Z') return '20240720T100000Z';
        if (dateString === '2024-07-20T11:00:00Z') return '20240720T110000Z';
        if (dateString === '2024-07-21T14:00:00Z') return '20240721T140000Z';
        if (dateString === '2024-07-21T15:30:00Z') return '20240721T153000Z';
        return 'INVALIDDATEFORMAT';
      });
  });

  // Test 1: Button Rendering (Default View)
  test('renders the "Add to Google Calendar" button and icon in default view', () => {
    render(<SessionCard session={mockSession} speaker={mockSpeaker} room={mockRoom} />);

    const calendarButton = screen.getByTestId('add-to-calendar-button-default');
    expect(calendarButton).toBeInTheDocument();
    expect(calendarButton).toHaveAttribute('aria-label', 'Add to Google Calendar');

    // Check for the icon within the button
    const calendarIcon = screen.getByTestId('calendar-icon');
    expect(calendarButton).toContainElement(calendarIcon);
  });

  // Test 1b: Button Rendering (Compact View)
  test('renders the "Add to Google Calendar" button and icon in compact view', () => {
    render(<SessionCard session={mockSession} speaker={mockSpeaker} room={mockRoom} isCompactView={true} />);

    const calendarButton = screen.getByTestId('add-to-calendar-button-compact');
    expect(calendarButton).toBeInTheDocument();
    expect(calendarButton).toHaveAttribute('aria-label', 'Add to Google Calendar');

    const calendarIcon = screen.getByTestId('calendar-icon');
    expect(calendarButton).toContainElement(calendarIcon);
  });

  // Test 2: Correct Link Generation (Default View)
  test('generates correct Google Calendar link on click in default view', () => {
    render(<SessionCard session={mockSession} speaker={mockSpeaker} room={mockRoom} />);

    const calendarButton = screen.getByTestId('add-to-calendar-button-default');
    fireEvent.click(calendarButton);

    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const expectedBaseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const expectedText = encodeURIComponent(mockSession.title);
    const expectedDates = '20240720T100000Z/20240720T110000Z';
    const expectedDetails = encodeURIComponent(mockSession.description || '');
    const expectedLocation = encodeURIComponent(mockRoom.name);

    const expectedUrl = `${expectedBaseUrl}&text=${expectedText}&dates=${expectedDates}&details=${expectedDetails}&location=${expectedLocation}`;
    expect(mockWindowOpen).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
  });

  // Test 2b: Correct Link Generation (Compact View)
  test('generates correct Google Calendar link on click in compact view', () => {
    render(<SessionCard session={mockSession} speaker={mockSpeaker} room={mockRoom} isCompactView={true} />);

    const calendarButton = screen.getByTestId('add-to-calendar-button-compact');
    fireEvent.click(calendarButton);

    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const expectedBaseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const expectedText = encodeURIComponent(mockSession.title);
    const expectedDates = '20240720T100000Z/20240720T110000Z'; // From mock
    const expectedDetails = encodeURIComponent(mockSession.description || '');
    const expectedLocation = encodeURIComponent(mockRoom.name);

    const expectedUrl = `${expectedBaseUrl}&text=${expectedText}&dates=${expectedDates}&details=${expectedDetails}&location=${expectedLocation}`;
    expect(mockWindowOpen).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
  });

  // Test 3: Link Generation with missing description and room
  test('generates correct link with empty details and location if not provided', () => {
    const sessionWithoutDetails: Session = {
      ...mockSession,
      description: undefined, // or null
      roomId: undefined, // To ensure room prop is not passed or room is undefined
    };
    // We pass undefined for room to SessionCard
    render(<SessionCard session={sessionWithoutDetails} speaker={mockSpeaker} room={undefined} />);

    const calendarButton = screen.getByTestId('add-to-calendar-button-default');
    fireEvent.click(calendarButton);

    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const expectedBaseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const expectedText = encodeURIComponent(sessionWithoutDetails.title);
    const expectedDates = '20240720T100000Z/20240720T110000Z';
    const expectedDetails = ''; // Empty because description is undefined
    const expectedLocation = ''; // Empty because room is undefined

    const expectedUrl = `${expectedBaseUrl}&text=${expectedText}&dates=${expectedDates}&details=${expectedDetails}&location=${expectedLocation}`;
    expect(mockWindowOpen).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
  });

  // Test 4: Link Generation with different times
  test('generates correct Google Calendar link with different times', () => {
    const differentTimeSession: Session = {
        ...mockSession,
        startsAt: '2024-07-21T14:00:00Z',
        endsAt: '2024-07-21T15:30:00Z',
    };
    render(<SessionCard session={differentTimeSession} speaker={mockSpeaker} room={mockRoom} />);

    const calendarButton = screen.getByTestId('add-to-calendar-button-default');
    fireEvent.click(calendarButton);

    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const expectedBaseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const expectedText = encodeURIComponent(differentTimeSession.title);
    const expectedDates = '20240721T140000Z/20240721T153000Z'; // From mock
    const expectedDetails = encodeURIComponent(differentTimeSession.description || '');
    const expectedLocation = encodeURIComponent(mockRoom.name);

    const expectedUrl = `${expectedBaseUrl}&text=${expectedText}&dates=${expectedDates}&details=${expectedDetails}&location=${expectedLocation}`;
    expect(mockWindowOpen).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
  });
});
