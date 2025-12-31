# POACHED - Elite Tennis Training

A premium web application that generates custom tennis drills and full training sessions based on player level, goals, and available time.

## Features

- **Custom Session Generation**: Create personalized training sessions tailored to your UTR level and goals
- **50+ Professional Drills**: Comprehensive drill library covering all aspects of tennis
- **8 Focus Areas**: Forehand, Backhand, Serve, Return, Volleys, Overheads, Movement, Patterns
- **Adaptive Difficulty**: Drills scale from UTR 1.0 to 16.5 with appropriate coaching cues
- **Session Management**: Save, duplicate, and manage your training sessions
- **Favorite Drills**: Bookmark your favorite drills for quick reference
- **User Profiles**: Track your progress with customizable player profiles
- **Premium Design**: Sleek black and crimson interface optimized for performance athletes

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Styling**: Custom CSS with CSS Variables
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. The Supabase configuration is already set up in the `.env` file

4. Start the development server (automatically started)

## Database Schema

The app uses the following main tables:

- **profiles**: User tennis profiles (UTR, handedness, playstyle, goals)
- **drills**: Library of 50+ tennis drills with instructions and coaching cues
- **sessions**: User-generated training sessions
- **session_drills**: Junction table linking drills to sessions
- **favorite_drills**: User's bookmarked drills

## Core Functionality

### Session Generation Algorithm

The drill generator:
1. Filters drills by selected focus areas
2. Matches drills to user's UTR range
3. Filters by intensity level
4. Distributes drills evenly across focus areas
5. Allocates time based on session length:
   - 15-30 min: 3 drills
   - 31-60 min: 5 drills
   - 61-120 min: 7 drills

### User Flow

1. **Landing Page**: Hero section with app overview
2. **Sign Up/Login**: Email/password authentication
3. **Dashboard**: View saved sessions and stats
4. **Create Session**: Configure UTR, focus areas, intensity, duration, environment
5. **Session Output**: View detailed drill instructions, favorite drills, duplicate/delete sessions
6. **Profile**: Edit UTR, handedness, playstyle, and training goals

## Design System

### Colors
- **Primary**: Black (#000000)
- **Accent**: Crimson (#DC143C)
- **Dark Gray**: #1a1a1a
- **Medium Gray**: #2a2a2a
- **Light Gray**: #3a3a3a

### Typography
- **Font Stack**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Weights**: 500 (medium), 600 (semibold), 700 (bold)

### Components
- Elevated cards with subtle borders
- Hover states with crimson highlights
- Smooth transitions (0.2s)
- Responsive breakpoints at 768px

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Drills are publicly readable but admin-writable
- Authentication required for all protected routes
- Secure session management with Supabase

## Build

Build the production version:
```bash
npm run build
```

The output will be in the `dist/` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and configs
│   └── supabase.ts
├── pages/             # Page components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── CreateSession.tsx
│   ├── SessionOutput.tsx
│   └── Profile.tsx
├── App.tsx            # Root component
├── main.tsx          # Entry point
└── index.css         # Global styles
```