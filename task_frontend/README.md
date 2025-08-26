# Task Management Frontend

A modern React-based frontend for the Task Management application with authentication and real-time task management.

## Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Route Protection**: Unauthenticated users cannot access protected routes
- **Task Management**: Create, read, update, delete, and toggle task status
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Tasks update immediately after changes
- **Filtering**: Filter tasks by status (all, pending, completed)

## Authentication Flow

1. **Registration**: Users can create new accounts
2. **Login**: Secure authentication with email/password
3. **Route Protection**: `/tasks` route is protected and requires authentication
4. **Logout**: Clears authentication state and redirects to home page
5. **Auto-redirect**: Authenticated users are automatically redirected to tasks page

## Protected Routes

- `/tasks` - Only accessible to authenticated users
- Unauthenticated users are redirected to `/login`

## Public Routes

- `/` - Home page with login/register options
- `/login` - Login form
- `/register` - Registration form

## Technical Implementation

- **Next.js 14** with App Router
- **React Context** for authentication state management
- **Axios** for API communication with credentials
- **React Hook Form** with Zod validation
- **TanStack Query** for server state management
- **TypeScript** for type safety

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Make sure the backend server is running on port 5000

## Authentication Context

The `AuthContext` provides:
- User authentication state
- Login/logout functions
- Route protection utilities
- Automatic token validation

## API Integration

- All API calls include credentials for cookie-based authentication
- Automatic error handling for authentication failures
- JWT tokens stored in HTTP-only cookies for security

## Security Features

- HTTP-only cookies for JWT storage
- Route protection for authenticated resources
- Automatic logout on authentication failures
- Secure token validation
