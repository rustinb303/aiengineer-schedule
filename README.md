# AI Engineer World's Fair 2025 - Schedule App 🎯

A modern, responsive web application for browsing and managing your personal schedule for the 2025 [AI Engineer](https://www.ai.engineer/) World's Fair in San Francisco.

Pulls the data live from the [raw json](https://sessionize.com/api/v2/w3hd2z8a/view/All) and [schedule json](https://www.ai.engineer/sessions-speakers-details.json).

## ✨ Features

- **📅 Interactive Schedule Views**
  - List view for easy browsing
  - Calendar view for visual planning
  - Filter by days (Feb 12-13, 2025)
- **⭐ Personalization**
  - Star sessions you're interested in
  - Bookmark sessions to build your schedule
  - Persistent storage across sessions
- **🔍 Smart Search & Filter**
  - Search sessions by title, description, or speaker
  - Filter by session type (Keynote, Workshop, etc.)
  - Filter by track
- **📱 Responsive Design**
  - Mobile-first approach
  - Dark mode support (follows system preference)
  - Modern, minimalist UI with subtle shadows
- **🔐 Authentication**
  - Clerk authentication integration
  - Firebase/Firestore backend for data persistence

## 🚀 Tech Stack

- **Framework:** Next.js 15.1.8 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Database:** Firebase Firestore
- **Package Manager:** pnpm
- **Deployment:** Vercel

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/PallavAg/aiengineer-schedule
cd aiengineer-schedule
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Running Tests

This project uses [Jest](https://jestjs.io/) for testing. To run the test suite, use the following command:

```bash
pnpm test
```

This will execute all unit and integration tests, providing a summary of test outcomes and coverage.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built for the AI Engineer World's Fair 2025
- Thanks to all contributors and the open source community

---

Made with ❤️ for the AI Engineering community
