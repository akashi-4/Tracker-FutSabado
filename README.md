# Tracker-FutSabado

A Next.js application for tracking stats and history for weekly friendly football (soccer) matches.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Testing](#testing)
- [Available Scripts](#available-scripts)
- [Utility Scripts](#utility-scripts)

## Features

-   **User Authentication**: Secure login and registration system using NextAuth.
-   **Player Management**: Add new players and view a list of all players.
-   **Match Tracking**: Record new match results, including teams and goals scored.
-   **Match History**: View a list of all past matches.
-   **Player Statistics**: Automatically calculates and displays player stats (wins, losses, draws, goals).
-   **Data Integrity**: Uses database transactions for reliable updates to match and player data.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: Custom components, using `lucide-react` for icons.
-   **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and integration tests.
-   **Schema Validation**: [Zod](https://zod.dev/) for validating API request bodies.

## Project Structure

The project follows a standard Next.js `app` router structure.

```
Tracker-FutSabado/
├── app/                      # Next.js App Router pages and API routes
│   ├── api/                  # API routes
│   ├── (public)/             # Publicly accessible pages (login, register)
│   └── (private)/            # Pages requiring authentication
├── components/               # Reusable React components
├── handlers/                 # Backend business logic (separated from API routes for testability)
│   ├── matchHandlers.ts
│   └── playerHandlers.ts
├── lib/                      # Shared library functions (e.g., auth config)
├── models/                   # Mongoose data models
├── tests/                    # Jest tests
│   ├── api/
│   ├── components/
│   └── handlers/
├── public/                   # Static assets
└── ...                       # Configuration files
```

## Getting Started

### Prerequisites

-   Node.js (v20 or later)
-   npm or yarn
-   MongoDB instance (local or cloud-hosted)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd Tracker-FutSabado
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the `Tracker-FutSabado` directory and add the following variables.

```env
MONGODB_URI=<your_mongodb_connection_string>
NEXTAUTH_SECRET=<your_secret_for_nextauth>
NEXTAUTH_URL=http://localhost:3000
```

-   `MONGODB_URI`: Your full MongoDB connection string.
-   `NEXTAUTH_SECRET`: A random string used to hash tokens. You can generate one with `openssl rand -base64 32`.
-   `NEXTAUTH_URL`: The base URL of the application, required for NextAuth in development.

### Running the Application

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

The project uses Jest and React Testing Library for testing. Tests are located in the `tests/` directory and mirror the project structure.

To run all tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To generate a test coverage report:

```bash
npm run test:coverage
```

## Available Scripts

-   `dev`: Starts the Next.js development server.
-   `build`: Builds the application for production.
-   `start`: Starts a production server.
-   `lint`: Lints the codebase using ESLint.

## Utility Scripts

These scripts are located in the root `Tracker-FutSabado` directory and can be run with `node`.

-   **`create-admin.mjs`**: A script to manually create an admin user in the database.
-   **`reset-stats.mjs`**: A script to reset all player statistics (wins, losses, etc.) to zero.
-   **`data-migration.mjs`**: A script for performing data migrations (use as needed). 