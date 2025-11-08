# 🎓 AI Assessment Platform - Frontend

Modern React-based frontend for the AI-powered adaptive learning and assessment platform.

## 🚀 Features

### 🔐 Authentication
- Login/Register with JWT
- Role-based access (Student, Faculty, Admin)
- Protected routes
- Auto token refresh

### 👨‍🎓 Student Features
- Personal dashboard with statistics
- Course enrollment and viewing
- Take assessments with real-time timer
- View results and analytics
- AI chat assistant for learning help
- Performance trend visualization

### 👨‍🏫 Faculty Features
- Course management (Create, Edit, Delete)
- Question bank management
- Assessment creation and configuration
- AI-powered question generation
- Student progress monitoring
- Assessment results analysis

### 🤖 AI Features
- AI chat assistant for personalized help
- Quick prompts for common questions
- Context-aware responses
- AI question generation integration

### 📊 Assessment Taking
- Full-screen test interface
- Live countdown timer with auto-submit
- Question navigation grid
- Flag questions for review
- Multiple question types (MCQ, True/False, Short Answer)
- Progress tracking
- Submit confirmation

## 🛠 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4.1
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Installation

```bash
# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏗 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ProtectedRoute.jsx
│   ├── dashboards/        # Dashboard components
│   │   ├── StudentDashboard.jsx
│   │   └── FacultyDashboard.jsx
│   ├── assessment/        # Assessment components
│   │   └── TakeAssessment.jsx
│   ├── ai/                # AI features
│   │   └── AIChat.jsx
│   └── common/            # Reusable components
│       ├── Navbar.jsx
│       └── UIComponents.jsx
├── context/               # React Context
│   └── AuthContext.jsx
├── hooks/                 # Custom hooks
│   └── useCustomHooks.js
├── services/              # API services
│   └── api.js
├── App.jsx               # Main app component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## 🎨 UI Components

### Reusable Components
- `Card` - Container with shadow and padding
- `Button` - Multiple variants (primary, secondary, danger, success)
- `Input` - Form input with error handling
- `Select` - Dropdown with options
- `Modal` - Popup dialog
- `LoadingSpinner` - Loading indicator
- `Alert` - Notification messages
- `Badge` - Status indicators
- `Table` - Data table with sorting

### Custom Hooks
- `useAPI` - API calls with loading/error states
- `useForm` - Form handling and validation
- `usePagination` - Pagination logic
- `useModal` - Modal state management
- `useTimer` - Countdown timer

## 🎯 Key Features Implementation

### Authentication Flow
```jsx
// Login and store JWT
const { login } = useAuth();
await login(email, password);

// Protected routes
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### API Calls
```jsx
import { courseAPI } from './services/api';

// Get all courses
const courses = await courseAPI.getAll();

// Create course
await courseAPI.create(courseData);
```

### Timer Implementation
```jsx
const timer = useTimer(duration, onTimeUp);

timer.start();
timer.pause();
timer.reset();
const formattedTime = timer.formatTime();
```

## 🎨 Styling with Tailwind v4.1

```jsx
// Using Tailwind classes
<div className="bg-white rounded-lg shadow-md p-6">
  <h1 className="text-3xl font-bold text-gray-900">
    Hello World
  </h1>
  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
    Click Me
  </button>
</div>
```

## 📱 Responsive Design

All components are fully responsive:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## 🔌 API Integration

The frontend communicates with the backend through Axios:

```javascript
// Automatic token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic auth error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

## 🚦 Available Routes

- `/` - Redirects to dashboard
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Role-based dashboard
- `/courses` - Course listing
- `/assessments` - Assessment listing
- `/assessments/:id/take` - Take assessment
- `/results/:id` - View result details
- `/analytics` - Analytics dashboard
- `/ai-chat` - AI assistant chat

## 🎭 Role-Based Access

```jsx
const DashboardRouter = () => {
  const { user } = useAuth();
  
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'admin':
      return <AdminDashboard />;
  }
};
```

## 🧪 Development

```bash
# Start dev server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## 📦 Build

```bash
# Create optimized production build
npm run build

# Output directory: dist/
```

## 🚀 Deployment

The frontend can be deployed to:
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 📄 License

MIT

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: November 8, 2025
