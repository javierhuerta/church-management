## 1. Dependencies Setup

- [x] 1.1 Install react-router-dom for navigation
- [x] 1.2 Install form libraries (react-hook-form, zod for validation)
- [x] 1.3 Install shadcn/ui CLI if not already configured

## 2. shadcn/ui Components Installation

- [x] 2.1 Add shadcn button component
- [x] 2.2 Add shadcn input component
- [x] 2.3 Add shadcn label component
- [x] 2.4 Add shadcn card component
- [x] 2.5 Add shadcn form component (or create custom with existing components)

## 3. Folder Structure Setup

- [x] 3.1 Create frontend/src/features/auth/pages directory
- [x] 3.2 Create frontend/src/features/auth/components directory
- [x] 3.3 Create frontend/src/layouts directory
- [x] 3.4 Create frontend/src/components/ui directory for shadcn components

## 4. Login Feature Implementation

- [x] 4.1 Create LoginForm component with email/password fields
- [x] 4.2 Add form validation with react-hook-form and zod
- [x] 4.3 Implement login API call to /auth/login endpoint
- [x] 4.4 Store JWT token in localStorage on successful login
- [x] 4.5 Handle login errors and display error message
- [x] 4.6 Create LoginPage that wraps LoginForm with card layout

## 5. App Layout Implementation

- [x] 5.1 Create AppLayout component with Header, main content area, Footer
- [x] 5.2 Create Header component with app title "Iglesia Adventista"
- [x] 5.3 Create Footer component with copyright text
- [x] 5.4 Implement content slot for child routes

## 6. Routing Setup

- [x] 6.1 Wrap App with BrowserRouter in main.tsx or App.tsx
- [x] 6.2 Configure public route for /login (no layout)
- [x] 6.3 Configure protected routes wrapped in AppLayout
- [x] 6.4 Add redirect logic for unauthenticated users to /login

## 7. Dashboard Page (Basic)

- [x] 7.1 Create basic DashboardPage component for protected route
- [x] 7.2 Add placeholder content showing user is logged in

## 8. Integration and Testing

- [x] 8.1 Verify login flow works end-to-end
- [x] 8.2 Verify protected route redirect works
- [x] 8.3 Verify layout displays on protected pages
- [x] 8.4 Run linter and fix any issues