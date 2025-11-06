# Layer 1 - Data & Core Infrastructure

This layer implements the foundational data structures and infrastructure for the AI Assessment Platform.

## 📁 Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # File storage config
├── models/
│   ├── User.js              # User schema (student/faculty/admin)
│   ├── Course.js            # Course and syllabus schema
│   ├── Question.js          # Question bank schema
│   ├── Assessment.js        # Assessment/test schema
│   ├── Result.js            # Student results schema
│   ├── Analytics.js         # Analytics data schema
│   └── index.js             # Model exports
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── error.js             # Error handling
│   └── rateLimiter.js       # Rate limiting
├── utils/
│   └── jwt.js               # JWT utilities
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── server.js               # Main server file
```

## 🗄️ Database Collections

### 1. Users Collection
- **Purpose**: Store user data (students, faculty, admins)
- **Key Features**:
  - Role-based access control
  - Password hashing with bcrypt
  - Context vector for personalization
  - Topic strengths tracking
  - Assessment history

### 2. Courses Collection
- **Purpose**: Store course information and syllabus
- **Key Features**:
  - Unit-wise syllabus structure
  - Topic weightage
  - Student enrollment tracking
  - Progress monitoring
  - Reference materials

### 3. Questions Collection
- **Purpose**: Question bank with metadata
- **Key Features**:
  - Multiple question types (MCQ, True/False, Short Answer, Coding, Essay)
  - Difficulty levels and Bloom's taxonomy
  - AI-generated questions support
  - Usage statistics
  - Media attachments (Cloudinary)

### 4. Assessments Collection
- **Purpose**: Store assessment configurations
- **Key Features**:
  - Adaptive assessment settings
  - Time limits and scheduling
  - Randomization options
  - Negative marking
  - Target audience filtering

### 5. Results Collection
- **Purpose**: Store student performance data
- **Key Features**:
  - Question-wise analysis
  - Topic-wise performance
  - Difficulty-wise breakdown
  - AI-generated insights
  - Proctoring data placeholder

### 6. Analytics Collection
- **Purpose**: Aggregated insights and reports
- **Key Features**:
  - Performance distribution
  - Trend analysis
  - Top performers identification
  - Students needing attention
  - AI-powered recommendations

## 🔐 Authentication System

### JWT-based Authentication
- Token generation and verification
- Refresh token support
- Role-based authorization
- Password hashing with bcrypt

### Middleware
- `protect`: Verify JWT token
- `authorize(...roles)`: Check user roles
- `checkOwnership`: Resource ownership validation

## 🛡️ Security Features

1. **Helmet.js**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: 
   - General API: 100 requests/15 minutes
   - Auth routes: 5 attempts/15 minutes
   - AI routes: 20 requests/hour
4. **Password Hashing**: bcrypt with salt rounds
5. **JWT Expiration**: 7 days (configurable)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for file storage)

### Setup Steps

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment Variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

3. **Start the Server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

4. **Verify Installation**

Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "success": true,
  "message": "AI Assessment Platform API is running",
  "timestamp": "2024-11-06T...",
  "environment": "development"
}
```

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Add database user with password
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string and add to `.env`

### Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get credentials from dashboard
3. Add to `.env` file

Folder structure in Cloudinary:
```
ai-assessment/
├── questions/
├── profiles/
├── reports/
└── resources/
```

## 📊 Schema Features

### Context Vector (User Model)
The user model includes a sophisticated context system for personalization:

```javascript
context: {
  topicStrengths: Map<String, Number>,  // Topic proficiency scores
  difficultyPreference: String,          // User preference
  averageSpeed: Number,                  // Seconds per question
  totalTestsTaken: Number,               // Total assessments
  lastAssessmentDate: Date              // Last activity
}
```

### Adaptive Assessment (Assessment Model)
Supports intelligent test generation:

```javascript
adaptiveConfig: {
  algorithm: 'hybrid',                   // difficulty/topic/hybrid
  targetStudent: ObjectId,               // Personalization target
  focusTopics: [String],                // Priority topics
  difficultyDistribution: {             // Question distribution
    easy: 30%,
    medium: 50%,
    hard: 20%
  }
}
```

## 🧪 Testing

Test database connection:
```bash
node -e "import('./config/database.js').then(m => m.default())"
```

Test Cloudinary connection:
```bash
node -e "import('./config/cloudinary.js').then(m => console.log('✅ Cloudinary configured'))"
```

## 📝 Model Methods

### User Model
- `matchPassword(password)`: Compare passwords
- `updateContext(results)`: Update learning profile

### Course Model
- `getAllTopics()`: Get all course topics
- `getTotalWeightage()`: Calculate weightage

### Question Model
- `updateStats(correct, time)`: Update usage stats
- `getCorrectAnswer()`: Get correct answer(s)

### Assessment Model
- `isActive()`: Check if assessment is live
- `updateStats(score, time)`: Update metrics

### Result Model
- `calculateTopicPerformance()`: Analyze by topic
- `identifyStrengthsWeaknesses()`: Find patterns

### Analytics Model
- `calculateDistribution(scores)`: Performance distribution

## 🔄 Next Steps

Layer 1 & 2 Complete! Layer 3 Implemented!

**Layer 3 - AI Intelligence Layer (COMPLETE)**
- ✅ Ollama integration for local LLM
- ✅ AI-powered question generation
- ✅ Adaptive assessment algorithm
- ✅ Student context tracking
- ✅ Learning insights & recommendations
- 📄 See [LAYER3_AI_IMPLEMENTATION.md](./LAYER3_AI_IMPLEMENTATION.md) for details

**Next: Layer 4 - Frontend (React Layer)**
- React UI components
- Student/Faculty/Admin dashboards
- Real-time assessment interface
- Analytics visualizations

## 📚 Dependencies

### Production Dependencies
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `dotenv`: Environment variables
- `cors`: CORS middleware
- `helmet`: Security headers
- `express-rate-limit`: Rate limiting
- `cloudinary`: File storage
- `multer`: File uploads
- `express-validator`: Input validation

### Development Dependencies
- `nodemon`: Auto-restart server

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string format
- Check IP whitelist in Atlas
- Ensure database user has correct permissions

### Cloudinary Upload Issues
- Verify API credentials
- Check file size limits
- Ensure correct folder permissions

### JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration settings
- Ensure proper header format: `Bearer <token>`

## 📄 License

MIT

---

**Status**: ✅ Layer 1 Complete - Database & Infrastructure Ready!
