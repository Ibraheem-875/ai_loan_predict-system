# AI-Powered Loan Decision System - Technology Stack Analysis

## Project Overview
A full-stack web application for AI-powered loan approval decisions with authentication, financial analysis, and application history tracking. The system uses a decoupled architecture with separate frontend and backend.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)          │
│                   Port: 5173 (Development)             │
└─────────────────────────────────────────────────────────┘
                           ↓ (HTTP/REST API)
                           ↓ (CORS Enabled)
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js/Express)                │
│                   Port: 5001 (Production)              │
│                   Port: 5000 (Development)             │
└─────────────────────────────────────────────────────────┘
                           ↓ (Mongoose)
┌─────────────────────────────────────────────────────────┐
│            Database (MongoDB - Cloud/Local)             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│       AI Service (Google Gemini API - Cloud)            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Backend Technologies (`server/`)

### Core Framework & Runtime
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **Node.js** | Latest | JavaScript runtime environment | `server/index.js` |
| **Express.js** | ^5.2.1 | Web framework & HTTP server | `server/index.js`, `server/routes/` |
| **CommonJS** | - | Module system for backend | `package.json` "type": "commonjs" |

### Database & ORM
| Technology | Version | Purpose | Usage |
|-----------|---------|---------|-------|
| **MongoDB** | - | NoSQL database (cloud or local) | `server/config/db.js` |
| **Mongoose** | ^9.5.0 | MongoDB ODM (Object Document Mapper) | `server/models/User.js`, `server/models/LoanApplication.js` |

**Database Configuration:**
- Connection string: `process.env.MONGODB_URI` or `mongodb://localhost:27017/loan-analyzer`
- Has fallback to in-memory mode if MongoDB is unavailable
- Retry logic with 5-second timeout
- Location: `server/config/db.js`

### Authentication & Security
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **JWT (jsonwebtoken)** | ^9.0.3 | Token-based authentication | `server/controllers/authController.js` |
| **bcryptjs** | ^3.0.3 | Password hashing & encryption | `server/controllers/authController.js` |
| **CORS (cors)** | ^2.8.6 | Cross-Origin Resource Sharing | `server/index.js` |

**CORS Configuration:**
- Allowed origins: Frontend URL (env variable) + `https://ai-loan-predict-system.vercel.app` + localhost
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials enabled for secure requests
- Location: `server/index.js`

### AI & Insights
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **Google Generative AI (Gemini)** | ^0.24.1 | AI-powered loan insights generation | `server/services/aiService.js` |

**AI Implementation Details:**
- Model: `gemini-flash-latest`
- Output Format: JSON
- Timeout: 12 seconds
- API Key: `process.env.GEMINI_API_KEY`
- Fallback responses when API is unavailable
- Location: `server/services/aiService.js`

### Environment Management
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **dotenv** | ^17.4.2 | Environment variable management | `server/index.js`, `server/.env` |

**Environment Variables Used:**
- `MONGODB_URI` - Database connection string
- `GEMINI_API_KEY` - Google AI API key
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend origin for CORS
- `JWT_SECRET` - Token signing secret

### API Structure

#### Authentication Routes (`server/routes/authRoutes.js`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Controllers:** `server/controllers/authController.js`
- Handles user registration with password hashing
- Generates JWT tokens on login
- Stores user credentials in MongoDB

#### Loan Analysis Routes (`server/routes/loanRoutes.js`)
- `POST /api/analyze-loan` - Loan eligibility analysis
- `GET /api/loan-history` - Retrieve user's loan applications

**Controllers:** `server/controllers/loanController.js`
- Analyzes financial data (income, credit score, EMI, tenure)
- Calls AI service for insights
- Stores applications in MongoDB
- Returns approval status with AI recommendations

### Middleware
| File | Purpose |
|------|---------|
| `server/middleware/` | JWT verification middleware for protected endpoints |

---

## 🎨 Frontend Technologies (`client/`)

### Core Framework & Build Tool
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **React** | ^19.2.5 | UI library & component framework | `client/src/` |
| **TypeScript** | ~6.0.2 | Type-safe JavaScript | `client/tsconfig.json`, `client/src/` |
| **Vite** | ^5.4.21 | Build tool & dev server | `client/vite.config.js` |
| **ES Modules** | - | Module system for frontend | `package.json` "type": "module" |

**Build Configuration:**
- Dev server port: 5173
- Proxy: `/api` routes to `http://localhost:5001`
- Production build: TypeScript compilation + Vite build
- Location: `client/vite.config.js`

### Styling & UI Components
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **Tailwind CSS** | ^3.4.19 | Utility-first CSS framework | `client/tailwind.config.js`, `client/src/` |
| **Tailwind CSS Vite Plugin** | ^4.2.4 | Vite integration for Tailwind | `client/vite.config.js` |
| **PostCSS** | ^8.5.10 | CSS transformation tool | `client/postcss.config.js` |
| **Autoprefixer** | ^10.5.0 | Browser prefix automation | `client/postcss.config.js` |
| **Radix UI Components** | Various | Accessible UI component library |

**Radix UI Modules Used:**
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-progress` - Progress bars
- `@radix-ui/react-slider` - Slider inputs
- `@radix-ui/react-slot` - Composition utility
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-tooltip` - Tooltip overlays

**CSS Utilities:**
- `class-variance-authority` - Component variant management
- `clsx` - Conditional class name composition
- `tailwind-merge` - Tailwind class merging

### Routing & Navigation
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **React Router DOM** | ^7.14.2 | Client-side routing | `client/src/App.tsx`, `client/src/components/ProtectedRoute.tsx` |

**Pages & Routes:**
- `LandingPage` - Public landing page
- `AuthPage` - Registration & login
- `AnalyzePage` - Loan analysis form
- `HistoryPage` - Application history
- Protected routes for authenticated users

### State Management
| Technology | Purpose | Location |
|-----------|---------|----------|
| **React Context API** | Global state (auth, tokens, user data) | `client/src/context/AuthContext.tsx` |

**State Management Details:**
- Manages logged-in user information
- Stores JWT tokens
- Authentication flow state
- No external state library (Redux/Zustand)

### HTTP Client
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **Axios** | ^1.15.2 | Promise-based HTTP client | `client/src/services/api.ts` |

**API Service Features:**
- Centralized API endpoint configuration
- Automatic JWT token injection in request headers
- Base URL configuration for backend API
- Request/response interceptors
- Location: `client/src/services/api.ts`

### Data Visualization
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **Recharts** | ^3.8.1 | React charting library | `client/src/components/Charts.tsx` |

**Chart Types:**
- Financial analysis visualizations
- Loan eligibility breakdown
- EMI vs income comparison

### Icons & Animations
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **Lucide React** | ^1.11.0 | Icon library (SVG-based) | `client/src/components/` |
| **Framer Motion** | ^12.38.0 | Animation library | `client/src/components/`, `client/src/pages/` |

**Animation Usage:**
- Smooth page transitions
- Component entrance/exit animations
- Loading state animations

### PDF Generation
| Technology | Version | Purpose | Location |
|-----------|---------|---------|----------|
| **jsPDF** | ^4.2.1 | PDF document generation | `client/src/utils/pdfGenerator.ts` |

**PDF Features:**
- Generate loan application reports
- Download analysis results as PDF
- Document formatting with financial data

### Utilities
| Technology | Purpose | Location |
|-----------|---------|----------|
| **EMI Calculator** | Loan EMI computation | `client/src/utils/emiCalculator.ts` |

**Calculator Features:**
- Monthly EMI calculation
- Total interest calculation
- Amortization schedule

### Component Structure

**Key Components:**
- `App.tsx` - Root component with routing
- `Navbar.tsx` - Navigation bar
- `ProtectedRoute.tsx` - Route protection for authenticated users
- `AuthPage` - Login/signup form
- `LoanForm.tsx` - Loan analysis form
- `EligibilityResult.tsx` - Loan decision result display
- `StatusTracker.tsx` - Application history tracker
- `AIInsights.tsx` - AI-generated insights display
- `Charts.tsx` - Financial visualizations
- `RiskIndicator.tsx` - Risk level indicator
- `EMIBreakdown.tsx` - EMI breakdown display
- `ExplanationEngine.tsx` - Detailed decision explanation
- `LoadingSkeleton.tsx` - Loading placeholder

---

## 🔗 Integration Points

### Backend → Frontend Communication
```
Frontend (React)
    ↓
Axios HTTP Client
    ↓
/api Proxy (Vite Dev Server)
    ↓
Express Backend (http://localhost:5001)
    ↓
Response (JSON)
```

### Frontend → Database
- No direct database access
- All data flows through Express backend
- Mongoose handles database operations

### Backend → AI Service
- Direct API calls to Google Gemini
- Uses `@google/generative-ai` SDK
- Timeout handling with fallback responses

---

## 🔐 Security Implementation

### Password Security
- Passwords hashed with **bcryptjs** (not stored as plaintext)
- Salt rounds: Standard configuration

### API Protection
- JWT token-based authentication
- Protected endpoints verified via middleware
- CORS restrictions for cross-origin requests
- Authorization header required for authenticated requests

### Data Validation
- Frontend form validation (React)
- Backend input validation (Express controllers)
- Type safety via TypeScript

---

## 📊 Data Models

### User Model (MongoDB)
```javascript
// server/models/User.js
- email: String (unique)
- password: String (hashed)
- name: String
- createdAt: Date
```

### LoanApplication Model (MongoDB)
```javascript
// server/models/LoanApplication.js
- userId: ObjectId (reference to User)
- income: Number
- creditScore: Number
- existingEMI: Number
- loanAmount: Number
- tenure: Number
- employment: String
- status: String (Approved/Rejected)
- aiInsights: Object
- createdAt: Date
```

---

## 🚀 Development & Deployment

### Local Development Setup
```bash
# Backend
cd server
npm install
npm run dev              # Watch mode
npm start               # Production

# Frontend
cd client
npm install
npm run dev             # Dev server on port 5173
npm run build           # Production build
npm run preview         # Preview production build
```

### Deployment
- Frontend: **Vercel** (indicated in README)
- Backend: Environment variables configured
- Database: Cloud MongoDB instance (via `MONGODB_URI`)
- AI: Google Gemini API (cloud-based)

**Environment Variables:**
- `MONGODB_URI` - Cloud database connection
- `GEMINI_API_KEY` - AI API credentials
- `FRONTEND_URL` - Production frontend URL
- `JWT_SECRET` - Token signing key

---

## 📈 Performance Considerations

### Frontend
- **Vite** for fast bundling and HMR (Hot Module Replacement)
- **TypeScript** for compile-time error checking
- **Code splitting** via React Router for lazy loading pages
- **Production build** with tree-shaking and minification

### Backend
- **Express** middleware chain for efficient request processing
- **MongoDB connection pooling** via Mongoose
- **Graceful degradation** if database unavailable
- **AI request timeout** (12 seconds) to prevent hanging

### Network
- **Compression** via Express (implicit)
- **CORS** for efficient cross-origin resource sharing
- **JWT tokens** for stateless authentication (scalable)

---

## 🎯 Technology Selection Rationale

| Technology | Why Chosen |
|-----------|-----------|
| **React** | Component-based UI, large ecosystem, TypeScript support |
| **TypeScript** | Type safety, better IDE support, reduced runtime errors |
| **Express.js** | Lightweight, flexible routing, minimal learning curve |
| **MongoDB** | Document-based, schema-flexible, native JSON support |
| **Mongoose** | Schema validation, middleware support, query building |
| **JWT** | Stateless auth, scalable, industry standard |
| **Google Gemini** | Advanced AI, JSON output support, reliable API |
| **Tailwind CSS** | Utility-first, rapid development, consistent design |
| **Vite** | Fast build tool, excellent DX, native TypeScript support |

---

## 🔄 Data Flow Example: Loan Analysis

```
1. User fills LoanForm.tsx
   ↓
2. Form submission via Axios (client/src/services/api.ts)
   ↓
3. POST /api/analyze-loan → Express backend
   ↓
4. loanController.js validates data
   ↓
5. Calls aiService.js → Google Gemini API
   ↓
6. Gemini returns JSON insights
   ↓
7. LoanApplication saved to MongoDB
   ↓
8. Response sent to frontend (status + insights)
   ↓
9. EligibilityResult.tsx displays result with animations (Framer Motion)
   ↓
10. User can download PDF (jsPDF) or view history
```

---

## ✅ Summary Table

| Layer | Technology Stack |
|-------|-----------------|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Radix UI |
| **Frontend Build** | Vite, PostCSS, Autoprefixer |
| **Frontend State** | React Context API |
| **Frontend Routing** | React Router DOM 7 |
| **Frontend HTTP** | Axios |
| **Frontend Charts** | Recharts |
| **Frontend Animations** | Framer Motion |
| **Frontend Utilities** | jsPDF, Lucide Icons |
| **Backend Runtime** | Node.js + Express 5 |
| **Backend ORM** | Mongoose 9 |
| **Backend Database** | MongoDB |
| **Backend Auth** | JWT + bcryptjs |
| **Backend AI** | Google Generative AI (Gemini) |
| **Backend Security** | CORS, JWT middleware |
| **DevOps** | Environment variables (.env) |
| **Deployment** | Frontend: Vercel, Backend: Custom (env-based) |

---

**Last Updated:** 2024
**Project:** AI-Powered Loan Decision System
**Architecture:** Full-Stack MERN (MongoDB, Express, React, Node.js) + Google AI
