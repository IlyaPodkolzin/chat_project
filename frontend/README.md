# Chat Frontend

This is the frontend application for the Chat project, built with React, TypeScript, and Material-UI.

## Features

- User authentication (login/register)
- Profile management
- Group chat creation and management
- Anonymous chat matching
- Real-time messaging
- Interest-based chat discovery

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Create a `.env.development` file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Dependencies

- React
- TypeScript
- Material-UI
- React Router
- Axios
- Web Vitals 