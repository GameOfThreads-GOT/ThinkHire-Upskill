# Frontend Modular Architecture

## Overview
The frontend has been refactored into a modular component-based architecture with reusable services and utilities.

## New Services

### `authService.js` (`src/services/authService.js`)
Centralized authentication and session management service.

**Methods:**
- `saveUser(user)` - Save user data to localStorage
- `getUser()` - Retrieve user data from localStorage
- `saveToken(token)` - Save authentication token
- `getToken()` - Retrieve authentication token
- `isAuthenticated()` - Check if user is logged in
- `logout()` - Clear all session data and localStorage
- `saveSessionScores(scores)` - Persist session scores
- `getSessionScores()` - Retrieve session scores
- `clearSessionScores()` - Clear session scores

**Usage:**
```javascript
import authService from '../services/authService';

// Logout user
authService.logout();

// Check authentication
if (authService.isAuthenticated()) {
  const user = authService.getUser();
}
```

## New Components

### `Header.jsx` (`src/components/Header.jsx`)
Reusable header component with navigation and logout functionality.

**Props:**
- `title` (string) - Page title displayed in header
- `showDashboardLink` (boolean) - Optional prop for showing dashboard link

**Features:**
- Automatic navigation rendering based on current route
- Logout dropdown menu with user account button
- Theme toggle integration
- Logo with hover effects

**Usage:**
```javascript
<Header title="Mock Interview Dashboard" />
```

### `StatisticsSection.jsx` (`src/components/StatisticsSection.jsx`)
Displays user statistics cards (interviews taken, questions practiced, current streak).

**Props:**
- `sessionScores` (array) - Array of session score objects

**Features:**
- Dynamic statistics calculation
- Responsive grid layout
- Hover animations

### `StartInterview.jsx` (`src/components/StartInterview.jsx`)
Component for starting a new interview session.

**Props:** None

**Features:**
- Domain selection dropdown
- Form validation
- Interview domain list (ML, DS, SE, Finance, PM, UX, HR, Sales)

### `KnowledgeCheck.jsx` (`src/components/KnowledgeCheck.jsx`)
Component for testing knowledge with text-based interview questions.

**Props:**
- `onSessionScoresUpdate` (function) - Callback for session score updates

**Features:**
- 30 questions per domain
- Real-time question display
- Answer submission to backend API
- Loading state with spinner
- Navigation to analysis page

### `SessionAnalysis.jsx` (`src/components/SessionAnalysis.jsx`)
Displays average session scores and reset functionality.

**Props:**
- `sessionScores` (array) - Array of session scores
- `onReset` (function) - Callback for reset button

**Features:**
- Average score calculation
- Video count display
- Reset button

### `PracticeCalendar.jsx` (`src/components/PracticeCalendar.jsx`)
Calendar view showing practice history.

**Props:**
- `sessionScores` (array) - Array of session scores with timestamps

**Features:**
- Monthly calendar view
- Navigation between months
- Highlights practice days
- Current/previous month day distinction

## Refactored Pages

### `Dashboard.jsx` (`src/pages/Dashboard.jsx`)
Main dashboard page using modular components.

**Before:** 806 lines of monolithic code
**After:** 72 lines using modular components

**Components Used:**
- Header
- StatisticsSection
- StartInterview
- KnowledgeCheck
- SessionAnalysis
- PracticeCalendar

### `LoginPage.jsx` (`src/pages/LoginPage.jsx`)
Updated to use authService for session management.

**Changes:**
- Replaced `localStorage.setItem()` with `authService.saveUser()`

### `SignupPage.jsx` (`src/pages/SignupPage.jsx`)
Updated to use authService for session management.

**Changes:**
- Replaced `localStorage.setItem()` with `authService.saveUser()`

### `AnalysisPage.jsx` (`src/pages/AnalysisPage.jsx`)
Updated to use Header component throughout all states.

**Changes:**
- Replaced inline header code with `<Header title="Answer Analysis" />`
- Removed duplicate header HTML (50+ lines saved)

## Key Improvements

1. **Code Reusability** - Components can be easily reused across pages
2. **Reduced Duplication** - Eliminated 50+ lines of repeated header code
3. **Centralized Auth** - All authentication logic in one service
4. **Better Maintenance** - Each component has single responsibility
5. **Responsive Design** - All components maintain responsive grid layouts
6. **Theme Support** - Consistent dark/light theme support across all components
7. **Logout Functionality** - Easy logout with session clearing
8. **Scalability** - Easy to add new features and components

## Component Hierarchy

```
App.jsx
├── Header (on all authenticated pages)
│   ├── Navigation
│   ├── Theme Toggle
│   └── Logout Menu
├── Dashboard
│   ├── StatisticsSection
│   │   └── Stat Cards
│   ├── StartInterview
│   │   └── Domain Selection Form
│   ├── KnowledgeCheck
│   │   └── Question & Answer Form
│   ├── SessionAnalysis
│   │   └── Score Display
│   └── PracticeCalendar
│       └── Monthly Calendar
├── LoginPage
├── SignupPage
└── AnalysisPage
    └── Performance Metrics
```

## Next Steps

To further improve modularity:
1. Extract form components (InputField, SelectField, etc.)
2. Create a shared `useAuth()` hook
3. Extract API calls into services
4. Create context for global state management
5. Build reusable button and card components
