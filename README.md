# REST Express Application

A full-stack web application built with React, Express, and TypeScript.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Wouter for routing
- React Query for state management
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL (Neon)
- Passport.js for authentication
- Express sessions
- Rate limiting
- Helmet for security

### Development Tools
- ESLint
- Prettier
- PostCSS
- Autoprefixer

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rest-express
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

4. Push database schema
```bash
npm run db:push
```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Build for Production
```bash
npm run build
```

#### Start Production Server
```bash
npm run start
```

### Type Checking
```bash
npm run check
```

## Project Structure

```
├── client/          # React frontend source
├── server/          # Express backend source
├── shared/          # Shared types and utilities
├── components.json  # Shadcn/ui configuration
├── drizzle.config.ts # Drizzle ORM configuration
├── package.json     # Dependencies and scripts
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
└── vite.config.ts   # Vite build configuration
```

## Features

- Modern React with hooks and functional components
- Type-safe development with TypeScript
- Responsive design with Tailwind CSS
- Form validation with React Hook Form and Zod
- Database integration with Drizzle ORM
- Authentication and session management
- API rate limiting and security headers
- Hot module replacement in development

## License

MIT License
