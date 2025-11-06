# 🚀 Quick Start Guide - Layer 2 APIs

## Test Flow Example

### 1. Start Server
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:5000

### 2. Login (Get Token)
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "alice.student@college.edu",
  "password": "student123"
}

Response:
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 3. Get Courses
```bash
GET http://localhost:5000/api/courses
Authorization: Bearer eyJhbGci...

Response:
{
  "success": true,
  "count": 1,
  "data": [ { course details } ]
}
```

### 4. Generate Adaptive Test
```bash
POST http://localhost:5000/api/assessments/generate
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "courseId": "690cd3c0f79dee3f79c3c2c1",
  "totalQuestions": 10,
  "duration": 30,
  "type": "practice"
}

Response:
{
  "success": true,
  "data": {
    "assessment": { ... },
    "analysis": {
      "totalQuestions": 10,
      "weakTopics": ["Arrays"],
      "difficultyDistribution": { easy: 3, medium: 5, hard: 2 }
    }
  }
}
```

### 5. Start Assessment
```bash
POST http://localhost:5000/api/assessments/{assessment_id}/start
Authorization: Bearer eyJhbGci...

Response:
{
  "success": true,
  "data": {
    "resultId": "...",
    "assessment": { questions without answers },
    "duration": 30,
    "startTime": "2024-11-06T..."
  }
}
```

### 6. Submit Assessment
```bash
POST http://localhost:5000/api/assessments/{assessment_id}/submit
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "resultId": "...",
  "answers": [
    {
      "questionId": "...",
      "answer": "Option A",
      "timeSpent": 45,
      "isFlagged": false
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    result with complete analysis
  }
}
```

### 7. View Results
```bash
GET http://localhost:5000/api/results/my-results
Authorization: Bearer eyJhbGci...

Response:
{
  "success": true,
  "stats": {
    "totalAttempts": 5,
    "passed": 4,
    "averageScore": 75
  },
  "data": [ results ]
}
```

### 8. Get Performance Report
```bash
GET http://localhost:5000/api/results/{result_id}/report
Authorization: Bearer eyJhbGci...

Response:
{
  "success": true,
  "data": {
    "scoreInfo": { obtained: 8, total: 10, percentage: 80 },
    "topicPerformance": [...],
    "strengths": ["Arrays", "Trees"],
    "weaknesses": ["Graphs"],
    "recommendations": [...],
    "comparisonWithPeers": {
      "percentile": 75,
      "betterThan": "75% of students"
    }
  }
}
```

### 9. View Analytics Dashboard
```bash
GET http://localhost:5000/api/analytics/dashboard
Authorization: Bearer eyJhbGci...

Student gets:
{
  "overview": { totalAttempts, averageScore, passRate },
  "performanceTrend": [...],
  "topStrengths": [...],
  "weakAreas": [...]
}

Faculty gets:
{
  "overview": { totalCourses, totalStudents, averageScore },
  "coursePerformance": [...],
  "recentActivity": [...]
}
```

## PowerShell Test Commands

```powershell
# Login
$body = @{email="alice.student@college.edu"; password="student123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token

# Get Courses
Invoke-RestMethod -Uri "http://localhost:5000/api/courses" -Method Get -Headers @{Authorization="Bearer $token"}

# Get Questions
Invoke-RestMethod -Uri "http://localhost:5000/api/questions" -Method Get -Headers @{Authorization="Bearer $token"}

# Get Dashboard
Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/dashboard" -Method Get -Headers @{Authorization="Bearer $token"}
```

## Test Accounts

```
Role: Admin
Email: admin@college.edu
Password: admin123

Role: Faculty  
Email: john.smith@college.edu
Password: faculty123

Role: Student
Email: alice.student@college.edu
Password: student123

Role: Student
Email: bob.student@college.edu
Password: student123
```

## Common Endpoints

```
Health Check:       GET  /health
Login:             POST /api/auth/login
Register:          POST /api/auth/register
Get Profile:       GET  /api/auth/me

Courses:           GET  /api/courses
Questions:         GET  /api/questions
Generate Test:     POST /api/assessments/generate
My Results:        GET  /api/results/my-results
Dashboard:         GET  /api/analytics/dashboard

Admin Users:       GET  /api/users
Create Course:     POST /api/courses
Bulk Import:       POST /api/questions/bulk-import
Course Analytics:  GET  /api/analytics/course/:id
```

## Response Format

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 20,
  "total": 100,
  "page": 1,
  "pages": 5
}
```

Error:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Next Steps

1. ✅ Layer 2 Complete - All APIs working
2. 🔄 Layer 3 - AI Integration (Ollama)
3. 📱 Layer 4 - Frontend (React)

Happy Testing! 🎉
