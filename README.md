# AI Assessment Platform - Complete Full Stack Application

🎓 **Intelligent Assessment System with AI-Powered Features**

A modern, full-stack web application for creating, managing, and taking assessments with AI-powered question generation and adaptive learning capabilities.

---

## 🚀 Quick Start

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend (Node.js + Express + MongoDB)
```bash
cd backend
npm install
# Configure MongoDB connection in .env
npm run dev
# Runs on http://localhost:5000
```

---

## 📋 Demo Credentials

Try the platform instantly with these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@example.com | student123 |
| **Faculty** | faculty@example.com | faculty123 |
| **Admin** | admin@example.com | admin123 |

---

## ✨ Key Features

### 🎯 For Students
- ✅ **Dashboard** - Overview of courses, assignments, and progress
- ✅ **Course Enrollment** - Browse and enroll in available courses
- ✅ **Take Assessments** - Complete timed assessments with auto-save
- ✅ **View Results** - Detailed results with question-by-question review
- ✅ **Analytics** - Performance trends, topic mastery, and insights
- ✅ **AI Chat Assistant** - 24/7 AI tutor for help and explanations

### 👨‍🏫 For Faculty
- ✅ **Create Courses** - Manage course content and structure
- ✅ **AI Question Generation** - Generate questions using AI
- ✅ **Create Assessments** - Build custom assessments
- ✅ **Monitor Performance** - Track student progress and analytics
- ✅ **Bulk Operations** - Manage multiple students efficiently

### 🤖 AI-Powered Features
- Question generation based on topics and difficulty
- Adaptive learning that adjusts to student performance
- Personalized feedback and recommendations
- Weak topic identification and targeted question generation
- Intelligent chat assistant for learning support

---

## 🏗️ Technology Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite 7.2.1** - Build tool with HMR
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js 22+** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Ollama** - Local AI model integration
- **Multer** - File uploads
- **Cloudinary** - Cloud storage

---

## 📁 Project Structure

```
placement/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── home/         # Landing page
│   │   │   ├── auth/         # Login, Register, Protected routes
│   │   │   ├── dashboards/   # Student & Faculty dashboards
│   │   │   ├── courses/      # Course pages
│   │   │   ├── assessment/   # Assessment & Results pages
│   │   │   ├── analytics/    # Analytics dashboard
│   │   │   ├── ai/           # AI Chat
│   │   │   └── common/       # Shared components
│   │   ├── context/          # React Context (Auth)
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.jsx           # Main app component
│   ├── API_DOCUMENTATION.md  # Complete API docs for backend dev
│   ├── vite.config.js        # Vite configuration
│   └── package.json
│
├── backend/                   # Express backend application
│   ├── controllers/          # Route controllers
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── services/             # Business logic services
│   ├── middleware/           # Custom middleware
│   ├── config/               # Configuration files
│   ├── utils/                # Utility functions
│   ├── server.js             # Main server file
│   ├── seed.js               # Database seeding
│   └── package.json
│
└── Documentation/            # Project documentation
    ├── LAYER1_STATUS.md      # Layer 1 completion status
    ├── LAYER3_IMPLEMENTATION_COMPLETE.md
    ├── ARCHITECTURE.md       # System architecture
    └── README.md             # This file
```

---

## 🔧 Configuration

### Frontend Configuration

1. **API URL** - Update in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

2. **Proxy** - Update in `frontend/vite.config.js`:
```javascript
const API_PROXY_TARGET = 'http://localhost:5000';
```

### Backend Configuration

Create `backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Ollama AI (optional)
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

---

## 📚 API Documentation

**Complete API documentation is available at: `frontend/API_DOCUMENTATION.md`**

### Key Endpoints:

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Faculty)
- `POST /api/courses/:id/enroll` - Enroll in course

#### Assessments
- `GET /api/assessments` - Get all assessments
- `POST /api/assessments/:id/start` - Start assessment
- `POST /api/assessments/:id/submit` - Submit assessment

#### AI
- `POST /api/ai/generate-questions` - Generate questions
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /ai/insights/:studentId` - Get AI insights

*See full API documentation for all endpoints, request/response formats, and authentication requirements.*

---

## 🎨 Features Overview

### ✅ Completed Pages

#### Public Pages
- **Home Page** - Responsive landing page with features, testimonials, CTA
- **Login** - Authentication with demo credentials
- **Register** - User registration

#### Authenticated Pages  
- **Dashboard** - Role-based dashboards (Student/Faculty/Admin)
- **Courses** - Course listing with filters and search
- **Course Details** - Complete course information with syllabus, assessments
- **Assessments** - Assessment listing with filters (upcoming, active, completed)
- **Take Assessment** - Assessment interface with timer, auto-save
- **Results** - Detailed results with question review and AI insights
- **Analytics** - Performance charts, topic mastery, trends
- **AI Chat** - Interactive AI learning assistant

### 🎨 Design Features
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Clean, professional UI (not AI-generated looking)
- ✅ Smooth page transitions
- ✅ Consistent spacing and typography
- ✅ Touch-friendly mobile interactions
- ✅ Accessible color schemes
- ✅ Loading states and error handling

---

## 🧪 Testing

### Demo Login Flow
1. Start both frontend and backend
2. Navigate to http://localhost:5173
3. Click "Sign In" or use demo credentials
4. Explore dashboards, courses, assessments

### Test Data
Backend includes seed data for:
- Demo users (student, faculty, admin)
- Sample courses
- Sample questions and assessments
- Mock results and analytics data

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway/Render)
```bash
cd backend
# Set environment variables
# Deploy with Node.js buildpack
```

---

## 📖 Documentation Files

| File | Description |
|------|-------------|
| `frontend/API_DOCUMENTATION.md` | Complete API reference for backend developer |
| `frontend/FRONTEND_README.md` | Frontend-specific documentation |
| `backend/README.md` | Backend-specific documentation |
| `backend/ARCHITECTURE.md` | System architecture overview |
| `backend/QUICKSTART.md` | Backend quick start guide |
| `LAYER3_IMPLEMENTATION_COMPLETE.md` | Layer 3 (AI) implementation status |
| `COMPLETE_PROJECT_STATUS.md` | Overall project status |

---

## 🎯 For Backend Developers

### Quick Integration Steps:

1. **Review API Documentation**
   ```bash
   cat frontend/API_DOCUMENTATION.md
   ```

2. **Set Up MongoDB**
   - Update `MONGODB_URI` in `backend/.env`
   - Run seed script: `node seed.js`

3. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Test API Endpoints**
   - Use demo credentials
   - Check console for API errors
   - Verify authentication flow

5. **Update Frontend Config** (if needed)
   ```javascript
   // frontend/vite.config.js
   const API_PROXY_TARGET = 'http://your-backend-url';
   ```

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Protected routes (frontend & backend)
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting (backend)
- ✅ SQL injection protection (Mongoose)
- ✅ XSS protection

---

## 🐛 Troubleshooting

### Frontend Issues
- **Port 5173 in use**: Vite will auto-select next available port
- **API calls failing**: Check `VITE_API_URL` in `.env`
- **Build errors**: Clear node_modules and reinstall

### Backend Issues
- **MongoDB connection**: Verify connection string in `.env`
- **Port 5000 in use**: Change `PORT` in `.env`
- **AI features not working**: Ensure Ollama is running

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Contributors

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **AI Integration**: Ollama (Local LLM)

---

## 🚀 Next Steps

1. ✅ **All core features implemented**
2. 🔄 **Backend integration** - Connect frontend to live backend
3. 🧪 **Testing** - Comprehensive testing with real data
4. 📱 **PWA** - Convert to Progressive Web App
5. 🌐 **Deployment** - Deploy to production

---

## 📞 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: See `/docs` folder
- **API Reference**: See `frontend/API_DOCUMENTATION.md`

---

**Built with ❤️ for modern education**

Last Updated: November 8, 2025
Version: 1.0.0
