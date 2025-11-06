# 🚀 Layer 3 Quick Reference Guide

## Quick Start

### 1. Verify Setup
```bash
# Check Ollama is running
ollama --version

# Check available models
ollama list

# Test AI services
npm run test:ai
```

### 2. Configuration
File: `backend/.env`
```properties
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

---

## 🎯 AI Service API Endpoints

### 1. Check Service Health
```bash
GET /api/ai/status
```
**Response:**
```json
{
  "status": "available",
  "models": ["llama3.2:1b", "llama3.2:latest"],
  "currentModel": "llama3.2:1b"
}
```

---

### 2. Generate Questions
```bash
POST /api/ai/generate-questions
Authorization: Bearer <faculty_token>
```
**Request:**
```json
{
  "topic": "JavaScript Arrays",
  "difficulty": "medium",
  "count": 5,
  "questionType": "mcq",
  "saveToDatabase": true
}
```
**Response:**
```json
{
  "success": true,
  "count": 5,
  "questions": [...]
}
```

---

### 3. Generate for Weak Topics
```bash
POST /api/ai/generate-weak-topics
Authorization: Bearer <faculty_token>
```
**Request:**
```json
{
  "studentId": "673b6b0b1c4e2a3f4c5d6e7f",
  "count": 10,
  "questionType": "mcq"
}
```

---

### 4. Enhance Existing Question
```bash
POST /api/ai/enhance-question/:questionId
Authorization: Bearer <faculty_token>
```
**Request:**
```json
{
  "improvementAreas": ["clarity", "difficulty"]
}
```

---

### 5. Get Student Insights
```bash
GET /api/ai/student-insights/:studentId
Authorization: Bearer <token>
```
**Response:**
```json
{
  "studentId": "...",
  "insights": {
    "strengths": ["Arrays", "Functions"],
    "weaknesses": ["Closures", "Promises"],
    "recommendations": [
      "Focus on JavaScript Closures",
      "Practice async/await patterns"
    ],
    "learningStyle": {
      "pace": "steady",
      "consistency": 75,
      "adaptability": 85
    },
    "masteryLevel": 72
  }
}
```

---

### 6. AI Chat Assistant
```bash
POST /api/ai/chat
Authorization: Bearer <token>
```
**Request:**
```json
{
  "message": "Explain JavaScript closures in simple terms",
  "context": [
    {
      "role": "user",
      "content": "I'm learning JavaScript"
    }
  ]
}
```

---

### 7. Pull New Model (Admin Only)
```bash
POST /api/ai/pull-model
Authorization: Bearer <admin_token>
```
**Request:**
```json
{
  "modelName": "mistral"
}
```

---

## 🔧 Service Usage in Code

### Import Services
```javascript
import ollamaService from './services/ollamaService.js';
import questionGeneratorService from './services/questionGeneratorService.js';
import adaptiveAssessmentService from './services/adaptiveAssessmentService.js';
import contextUpdateService from './services/contextUpdateService.js';
```

### Generate Questions
```javascript
const questions = await questionGeneratorService.generateAndSave({
  topic: 'JavaScript Closures',
  difficulty: 'medium',
  count: 5,
  questionType: 'mcq'
});
```

### Generate Adaptive Assessment
```javascript
const assessment = await adaptiveAssessmentService.generateAdaptiveAssessment({
  studentId: '673b6b0b1c4e2a3f4c5d6e7f',
  count: 20,
  config: {
    focusOnWeakTopics: true,
    adaptiveDifficulty: true
  }
});
```

### Update Student Context
```javascript
await contextUpdateService.updateStudentContext(
  studentId,
  resultId
);
```

### Get Learning Insights
```javascript
const insights = await contextUpdateService.getLearningInsights(
  studentId
);
```

---

## 📊 Question Generation Parameters

### Difficulty Levels
- `easy` - Basic understanding
- `medium` - Applied knowledge
- `hard` - Complex problem-solving

### Question Types
- `mcq` - Multiple Choice Questions
- `true-false` - True/False Questions
- `short-answer` - Short Answer Questions
- `long-answer` - Descriptive Questions

### Topics (Examples)
- JavaScript Arrays
- React Hooks
- Node.js Express
- MongoDB Queries
- REST APIs
- Authentication & Authorization

---

## 🧪 Testing

### Run All AI Tests
```bash
npm run test:ai
```

### Test Individual Service
```javascript
// Test Ollama connection
const isAvailable = await ollamaService.isAvailable();

// Test text generation
const text = await ollamaService.generate('What is 2+2?');

// Test question generation
const questions = await questionGeneratorService.generateQuestions({
  topic: 'Arrays',
  difficulty: 'easy',
  count: 1
});
```

---

## 🐛 Troubleshooting

### Issue: "Model not found"
**Solution:**
```bash
# Check available models
ollama list

# Pull missing model
ollama pull llama3.2:1b

# Update .env
OLLAMA_MODEL=llama3.2:1b
```

### Issue: "Ollama service not available"
**Solution:**
```bash
# Check if Ollama is running
ollama list

# Start Ollama (it should auto-start)
# Or restart your computer
```

### Issue: "Request timeout"
**Solution:**
- Increase timeout in service (currently 60s)
- Use smaller model (llama3.2:1b instead of llama3.2:latest)
- Close memory-intensive applications

### Issue: "Memory error"
**Solution:**
```bash
# Use smaller model
ollama pull llama3.2:1b

# Update .env
OLLAMA_MODEL=llama3.2:1b
```

---

## 📈 Performance Tips

### 1. **Model Selection**
- **llama3.2:1b** (1.3GB) - Fastest, good for testing
- **llama3.2:latest** (2GB) - Better quality, slower
- **mistral** (4GB) - Best quality, requires more memory

### 2. **Optimize Prompts**
```javascript
// Good: Specific and concise
Generate 5 medium difficulty MCQ questions on JavaScript Arrays

// Bad: Vague and verbose
Please generate some questions about programming
```

### 3. **Batch Operations**
```javascript
// Generate multiple questions at once
await questionGeneratorService.generateAndSave({
  count: 10  // Better than 10 separate calls
});
```

### 4. **Cache Results**
```javascript
// Store generated questions in database
// Reuse for future assessments
```

---

## 🔐 Security Notes

- ✅ All endpoints require authentication
- ✅ Role-based access control (Student/Faculty/Admin)
- ✅ Input validation on all parameters
- ✅ Rate limiting configured
- ✅ No sensitive data in AI prompts

---

## 📚 Additional Resources

- **Full Documentation**: `LAYER3_AI_IMPLEMENTATION.md`
- **Architecture Diagrams**: `LAYER3_ARCHITECTURE.md`
- **Implementation Summary**: `LAYER3_SUMMARY.md`
- **Complete Project Status**: `COMPLETE_PROJECT_STATUS.md`

---

## ✅ Quick Health Check

```bash
# 1. Test Ollama
curl http://localhost:11434/api/tags

# 2. Test Backend
curl http://localhost:5000/api/ai/status

# 3. Run test suite
npm run test:ai

# Expected: 4/4 tests passing ✅
```

---

*Last Updated: November 6, 2025*  
*Status: Production Ready 🚀*
