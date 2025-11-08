# API Endpoints Documentation for Backend Developer

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user
```json
Request Body:
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student" | "faculty" | "admin"
}

Response:
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### POST /auth/login
Login user
```json
Request Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "token": "string",
    "user": { /* user object */ }
  }
}
```

### GET /auth/me
Get current user profile (Protected)
```json
Response:
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    // ... other user fields
  }
}
```

### PUT /auth/update-profile
Update user profile (Protected)
```json
Request Body:
{
  "name": "string",
  "email": "string",
  // ... other updateable fields
}

Response:
{
  "success": true,
  "data": { /* updated user object */ }
}
```

---

## 👥 User Endpoints

### GET /users
Get all users (Protected - Faculty/Admin only)
```
Query Parameters:
  - role: string (optional) - filter by role
  - page: number (optional)
  - limit: number (optional)

Response:
{
  "success": true,
  "data": [/* array of users */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### GET /users/:id
Get user by ID (Protected)

### PUT /users/:id
Update user (Protected - Admin only)

### DELETE /users/:id
Delete user (Protected - Admin only)

### POST /users/bulk-create
Create multiple users (Protected - Admin only)

---

## 📚 Course Endpoints

### GET /courses
Get all courses
```
Query Parameters:
  - limit: number (optional)
  - department: string (optional)
  - semester: string (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "description": "string",
      "instructor": "string",
      "credits": number,
      "department": "string",
      "semester": "string",
      "enrolledCount": number
    }
  ]
}
```

### GET /courses/:id
Get course by ID

### POST /courses
Create new course (Protected - Faculty only)
```json
Request Body:
{
  "code": "string",
  "name": "string",
  "description": "string",
  "credits": number,
  "department": "string",
  "semester": "string"
}
```

### PUT /courses/:id
Update course (Protected - Faculty only)

### DELETE /courses/:id
Delete course (Protected - Faculty only)

### POST /courses/:id/enroll
Enroll in course (Protected - Student only)

---

## ❓ Question Endpoints

### GET /questions
Get all questions (Protected)
```
Query Parameters:
  - limit: number (optional)
  - courseId: string (optional)
  - difficulty: string (optional)
```

### GET /questions/:id
Get question by ID (Protected)

### POST /questions
Create question (Protected - Faculty only)
```json
Request Body:
{
  "courseId": "string",
  "text": "string",
  "type": "mcq" | "true-false" | "short-answer",
  "options": ["string"] (for MCQ),
  "correctAnswer": "string" | number,
  "explanation": "string",
  "difficulty": "easy" | "medium" | "hard",
  "topic": "string",
  "points": number
}
```

### PUT /questions/:id
Update question (Protected - Faculty only)

### DELETE /questions/:id
Delete question (Protected - Faculty only)

---

## 📝 Assessment Endpoints

### GET /assessments
Get all assessments
```
Query Parameters:
  - limit: number (optional)
  - courseId: string (optional)
  - status: string (optional)
```

### GET /assessments/:id
Get assessment by ID with questions

### POST /assessments
Create assessment (Protected - Faculty only)
```json
Request Body:
{
  "title": "string",
  "courseId": "string",
  "description": "string",
  "duration": number (minutes),
  "totalMarks": number,
  "questionIds": ["string"],
  "startTime": "ISO Date",
  "endTime": "ISO Date",
  "isAdaptive": boolean
}
```

### PUT /assessments/:id
Update assessment (Protected - Faculty only)

### DELETE /assessments/:id
Delete assessment (Protected - Faculty only)

### POST /assessments/generate
Generate assessment using AI (Protected - Faculty only)
```json
Request Body:
{
  "courseId": "string",
  "title": "string",
  "count": number,
  "difficulty": "mixed" | "easy" | "medium" | "hard",
  "topics": ["string"]
}
```

### POST /assessments/:id/start
Start assessment (Protected - Student only)
```json
Response:
{
  "success": true,
  "data": {
    "attemptId": "string",
    "startTime": "ISO Date"
  }
}
```

### POST /assessments/:id/submit
Submit assessment (Protected - Student only)
```json
Request Body:
{
  "answers": [
    {
      "questionId": "string",
      "answer": "string" | number
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "resultId": "string",
    "score": number,
    "totalMarks": number,
    "percentage": number
  }
}
```

---

## 📊 Result Endpoints

### GET /results
Get all results (Protected)
```
Query Parameters:
  - studentId: string (optional)
  - assessmentId: string (optional)
  - courseId: string (optional)
```

### GET /results/:id
Get result by ID with detailed breakdown

### GET /results/my-results
Get current user's results (Protected - Student)

### GET /results/:id/report
Get detailed result report

### GET /results/student/:studentId
Get all results for a student (Protected - Faculty/Admin)

### GET /results/assessment/:assessmentId
Get all results for an assessment (Protected - Faculty/Admin)

### DELETE /results/:id
Delete result (Protected - Admin only)

---

## 📈 Analytics Endpoints

### GET /analytics/dashboard
Get dashboard analytics for current user
```json
Response (Student):
{
  "success": true,
  "data": {
    "totalAssessments": number,
    "completedAssessments": number,
    "averageScore": number,
    "recentResults": [/* recent results */],
    "performanceTrend": [/* trend data */],
    "weakTopics": ["string"]
  }
}

Response (Faculty):
{
  "success": true,
  "data": {
    "totalCourses": number,
    "totalStudents": number,
    "totalAssessments": number,
    "averageClassScore": number,
    "recentActivity": [/* activity data */]
  }
}
```

### GET /analytics/student/:id
Get analytics for specific student (Protected - Faculty/Admin)

### GET /analytics/course/:id
Get analytics for specific course (Protected - Faculty/Admin)

### GET /analytics/assessment/:id
Get analytics for specific assessment (Protected - Faculty/Admin)

### GET /analytics/trends
Get performance trends
```
Query Parameters:
  - studentId: string (optional)
  - courseId: string (optional)
  - startDate: ISO Date (optional)
  - endDate: ISO Date (optional)
```

### GET /analytics/topic-analysis
Get topic-wise analysis
```
Query Parameters:
  - studentId: string (optional)
  - courseId: string (optional)
```

### GET /analytics/comparative
Get comparative analytics

---

## 🤖 AI Endpoints

### GET /ai/status
Check AI service status
```json
Response:
{
  "success": true,
  "data": {
    "status": "connected" | "disconnected",
    "model": "string",
    "version": "string"
  }
}
```

### POST /ai/generate-questions
Generate questions using AI (Protected - Faculty)
```json
Request Body:
{
  "courseId": "string",
  "count": number,
  "topic": "string",
  "difficulty": "easy" | "medium" | "hard",
  "type": "mcq" | "true-false" | "short-answer"
}

Response:
{
  "success": true,
  "data": {
    "questions": [/* generated questions */]
  }
}
```

### POST /ai/generate-for-weak-topics
Generate questions for student's weak topics (Protected - Faculty)
```json
Request Body:
{
  "studentId": "string",
  "courseId": "string",
  "count": number
}
```

### POST /ai/enhance-question/:id
Enhance existing question using AI (Protected - Faculty)

### GET /ai/insights/:studentId
Get AI-powered insights for student (Protected)
```json
Response:
{
  "success": true,
  "data": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "recommendations": ["string"],
    "studyPlan": ["string"]
  }
}
```

### POST /ai/chat
Chat with AI assistant (Protected)
```json
Request Body:
{
  "message": "string",
  "context": {
    "courseId": "string" (optional),
    "topic": "string" (optional)
  }
}

Response:
{
  "success": true,
  "data": {
    "response": "string",
    "suggestions": ["string"] (optional)
  }
}
```

### POST /ai/pull-model
Pull/download AI model (Protected - Admin only)
```json
Request Body:
{
  "modelName": "string"
}
```

---

## 📌 Important Notes for Backend Developer

### 1. Response Format
All responses should follow this format:
```json
Success:
{
  "success": true,
  "data": { /* response data */ }
}

Error:
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" (optional)
}
```

### 2. Pagination
For list endpoints, include pagination info:
```json
{
  "success": true,
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 3. Error Status Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### 4. CORS Configuration
Enable CORS for frontend origin: http://localhost:5173

### 5. File Uploads (if needed)
Use multipart/form-data for file uploads

### 6. WebSocket (for real-time updates)
Consider WebSocket for:
- Real-time assessment updates
- Live notifications
- Chat features

---

## 🔄 Demo Credentials

The frontend includes these demo accounts for testing:

```
Student:
  email: student@example.com
  password: student123

Faculty:
  email: faculty@example.com
  password: faculty123

Admin:
  email: admin@example.com
  password: admin123
```

**Ensure these exist in your database or create them during seeding.**

---

## 🚀 Quick Start for Backend Developer

1. Update API URL in `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. Ensure backend is running on port 5000

3. Start frontend: `npm run dev` (runs on port 5173)

4. Test with demo credentials

5. Check browser console for API errors

---

## 📞 API Testing

Use these endpoints for quick testing:
- Health check: GET /api/health
- Auth test: POST /api/auth/login (with demo credentials)
- Protected route test: GET /api/auth/me (with token)

---

**Last Updated:** November 8, 2025
**Frontend Version:** 1.0.0
**Required Backend Version:** 1.0.0+
