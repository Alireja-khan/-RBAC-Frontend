# RBAC Frontend Application

This is the frontend application for the Role-Based Access Control (RBAC) Project Management System.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

## Overview
The frontend application provides a complete user interface for the RBAC system with role-based access control, invitation-based registration, and project management capabilities. Built with React and TypeScript, it offers a responsive and intuitive user experience.

## Features

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Role-based UI rendering (ADMIN, MANAGER, STAFF)
- Protected routes with automatic redirection
- Session persistence across browser refreshes

### User Management (Admin Only)
- User invitation system with role assignment
- User listing with search and pagination
- Role modification (ADMIN ↔ MANAGER ↔ STAFF)
- User activation/deactivation
- Invite token validation

### Project Management
- Project creation for all authenticated users
- Project listing with status filtering
- Admin-only project editing and deletion
- Soft delete implementation with restoration capability

### UI/UX Features
- Responsive design optimized for all screen sizes
- Loading states and error handling
- Form validation and user feedback
- Intuitive navigation and layout
- Dark/light mode support

## Tech Stack

- **Core**: React 18, TypeScript
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **UI Components**: Tailwind CSS, React Icons
- **Form Handling**: React Hook Form
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript support

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-frontend-repo-url>
cd rbac-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables (see [Environment Variables](#environment-variables))

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5174`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://rbac-backend-11.onrender.com
VITE_APP_NAME=RBAC Project Management
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
src/
├── api/                 # API service definitions
│   ├── auth.api.ts     # Authentication endpoints
│   ├── project.api.ts  # Project management endpoints
│   └── user.api.ts     # User management endpoints
├── auth/               # Authentication context and providers
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   ├── ProtectedRoute.tsx
│   └── useAuth.ts
├── components/         # Reusable UI components
├── lib/                # Utility libraries and configurations
│   └── axios/          # Axios instances with interceptors
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── InviteRegister.tsx
│   ├── Users.tsx
│   └── Projects.tsx
├── types/              # TypeScript type definitions
│   ├── auth.ts
│   └── project.types.ts
└── App.tsx            # Main application component
```

## Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run lint:fix    # Run ESLint with auto-fix
npm run type-check  # TypeScript type checking
```

## Deployment

### Build for Production
```bash
npm run build
```

The production build will be output to the `dist` folder.

### Environment for Production
Create a `.env.production` file with production environment variables:

```env
VITE_API_URL=https://your-production-api.com
VITE_APP_NAME=RBAC Project Management
```

### Hosting Options
- **Vercel**: Direct deployment from GitHub
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Static website hosting
- **Firebase Hosting**: `firebase deploy`

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Development Guidelines

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful component and function names
- Use consistent naming conventions

### Git Workflow
- Create feature branches from `main`
- Follow conventional commit messages
- Squash commits before merging
- Ensure all tests pass before PR submission

### Performance Optimization
- Implement code splitting for large components
- Use React.memo for expensive components
- Optimize images and assets
- Implement proper caching strategies