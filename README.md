# AI-Powered Loan Decision System

## Overview
The AI-Powered Loan Decision System is a full-stack web application designed to streamline the loan  approval process. By leveraging a custom backend and a sleek frontend, it analyzes user-provided financial information to predict the likelihood of loan approval. It also maintains a history of user applications, ensuring transparency and ease of tracking.

## Technical Architecture

The platform uses a decoupled architecture with a React frontend and a Node.js backend.

### 1. Frontend (`client/`)
Built with React and Vite, utilizing TypeScript for type safety.
- **Routing & Navigation**: Uses standard routing for navigating between the `LandingPage`, `AnalyzePage`, and `HistoryPage`. The `Navbar` ensures quick access.
- **Authentication Flow**: Users can sign up and log in via the `AuthPage`. Unauthenticated users are restricted from core features using a `ProtectedRoute` wrapper.
- **State Management**: Uses React Context (`client/src/context/`) to globally manage authentication state (like the logged-in user and tokens).
- **API Integration**: The `services/api.ts` handles API calls to the backend, keeping the component files clean and focused on UI logic.

### 2. Backend (`server/`)
Built with Node.js and Express, backed by a MongoDB database.
- **Controllers & Routes**: 
  - **Auth**: `authController.js` and `authRoutes.js` handle secure user registration and login, returning JSON Web Tokens (JWT).
  - **Loan Handling**: `loanController.js` and `loanRoutes.js` process the financial data and simulate the AI-powered decision logic.
- **Database Models (Mongoose)**:
  - `User.js`: Schema for storing user credentials.
  - `LoanApplication.js`: Schema for storing individual loan requests, amounts, and the final decision outcome.
- **Middleware**: Custom middleware in `server/middleware/` protects the API endpoints by verifying incoming JWT tokens.

## How the Application Works

1. **User Registration & Login**: A user visits the application and signs up. Their credentials are saved in the database, and they receive a JWT token.
2. **Submitting Data**: The authenticated user navigates to the Analyze page, filling out a form with financial details (e.g., income, existing loans, credit score).
3. **Data Processing**: The frontend sends this data to the backend via a secure API request. 
4. **AI Prediction**: The backend evaluates the criteria against predefined thresholds or external models to return an "Approved" or "Rejected" status.
5. **Dashboard & History**: The user sees the result on the screen instantly. They can visit the `HistoryPage` anytime to see all their past requests and statuses managed by the `StatusTracker` component.
