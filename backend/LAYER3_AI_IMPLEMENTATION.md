# Layer 3: AI Intelligence Layer - Complete Implementation

## Overview
Layer 3 provides AI-powered features for the assessment platform using **Ollama** for local LLM integration. This layer includes question generation, adaptive assessment algorithms, and student context tracking.

---

## 🎯 Components Implemented

### 1. **Ollama Service** (`services/ollamaService.js`)
Local LLM integration service for AI operations.

**Features:**
- Text generation with customizable parameters
- Chat-based interactions
- Model management (list, pull)
- Service health checking

**Key Methods:**
```javascript
// Generate text completion
await ollamaService.generate(prompt, {
  temperature: 0.7,
  max_tokens: 500
});

// Chat with context
await ollamaService.chat(messages, {
  temperature: 0.7
});

// Check service availability
await ollamaService.isAvailable();
```

### 2. **Question Generator Service** (`services/questionGeneratorService.js`)
AI-powered question generation for creating assessment content.

**Features:**
- Generate questions by topic, difficulty, and type
- Support for multiple question types (MCQ, True/False, Short Answer)
- Auto-saving to database
- Question enhancement
- Weak topic targeting

**Usage Example:**
```javascript
// Generate and save questions
const result = await questionGeneratorService.generateAndSave({
  topic: 'Data Structures',
  difficulty: 'medium',
  count: 5,
  questionType: 'multiple-choice',
  course: courseId,
  context: 'Focus on arrays and linked lists'
});

// Generate for weak topics
const questions = await questionGeneratorService.generateForWeakTopics(
  ['Arrays', 'Stacks'],
  courseId
);
```

### 3. **Adaptive Assessment Service** (`services/adaptiveAssessmentService.js`)
Intelligent assessment generation based on student performance.

**Features:**
- Student performance analysis
- Topic-based difficulty adjustment
- Personalized question selection
- Trend analysis
- Optimal difficulty determination

**Analysis Output:**
```javascript
{
  topicStats: [
    { topic: 'Arrays', accuracy: 65, status: 'average', trend: 'improving' }
  ],
  weakTopics: ['Linked Lists', 'Trees'],
  strongTopics: ['Arrays', 'Sorting'],
  optimalDifficulty: 'medium',
  averageScore: 72,
  recentTrend: 'improving'
}
```

### 4. **Context Update Service** (`services/contextUpdateService.js`)
Tracks and updates student learning context after each assessment.

**Features:**
- Automatic context updates
- Learning insights generation
- Progress trend analysis
- Personalized recommendations
- Mastery level calculation

**Insights Example:**
```javascript
{
  strengths: [
    { topic: 'Arrays', score: 85, level: 'proficient' }
  ],
  weaknesses: [
    { topic: 'Trees', score: 45, needsWork: true }
  ],
  learningStyle: {
    pace: 'moderate',
    consistency: 'consistent'
  },
  progressTrend: {
    trend: 'improving',
    percentage: 12
  },
  recommendations: [
    {
      type: 'focus',
      priority: 'high',
      message: 'Focus on improving: Trees, Graphs'
    }
  ]
}
```

---

## 🛣️ API Endpoints

### AI Routes (`/api/ai/`)

#### 1. Check Ollama Status
```http
GET /api/ai/status
Authorization: Bearer <token>
Roles: Faculty, Admin
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "models": [
      {
        "name": "llama2",
        "size": "3.8 GB",
        "modified": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### 2. Generate Questions
```http
POST /api/ai/generate-questions
Authorization: Bearer <token>
Roles: Faculty, Admin

Body:
{
  "topic": "Data Structures",
  "difficulty": "medium",
  "count": 5,
  "questionType": "multiple-choice",
  "course": "course_id",
  "context": "Focus on practical applications",
  "saveToDatabase": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 5 questions, saved 5",
  "data": {
    "generated": 5,
    "saved": 5,
    "failed": 0,
    "questions": [...]
  }
}
```

#### 3. Generate for Weak Topics
```http
POST /api/ai/generate-for-weak-topics
Authorization: Bearer <token>
Roles: Faculty, Admin

Body:
{
  "studentId": "student_id",
  "courseId": "course_id"
}
```

#### 4. Enhance Question
```http
POST /api/ai/enhance-question/:id
Authorization: Bearer <token>
Roles: Faculty, Admin
```

#### 5. Get Student Insights
```http
GET /api/ai/insights/:studentId
Authorization: Bearer <token>
Roles: Student (self), Faculty, Admin
```

#### 6. Chat with AI
```http
POST /api/ai/chat
Authorization: Bearer <token>

Body:
{
  "message": "Explain binary search trees",
  "context": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

#### 7. Pull Model (Admin Only)
```http
POST /api/ai/pull-model
Authorization: Bearer <token>
Roles: Admin

Body:
{
  "modelName": "mistral"
}
```

---

## 🔧 Setup Instructions

### 1. Install Ollama

**Windows:**
```powershell
# Download from https://ollama.ai/download
# Run the installer
```

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

**macOS:**
```bash
brew install ollama
```

### 2. Pull a Model
```bash
# Recommended models:
ollama pull llama2        # General purpose (3.8GB)
ollama pull mistral       # Fast and efficient (4.1GB)
ollama pull codellama     # Code-focused (3.8GB)
ollama pull phi           # Lightweight (1.6GB)
```

### 3. Start Ollama Service
```bash
ollama serve
# Service runs on http://localhost:11434
```

### 4. Configure Environment
Update `.env`:
```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 5. Verify Installation
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Or through the API
curl -X GET http://localhost:5000/api/ai/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing AI Features

### Test Question Generation
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACULTY_TOKEN" \
  -d '{
    "topic": "Arrays",
    "difficulty": "medium",
    "count": 3,
    "questionType": "multiple-choice",
    "course": "COURSE_ID",
    "saveToDatabase": false
  }'
```

### Test AI Chat
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Explain time complexity in simple terms"
  }'
```

### Test Student Insights
```bash
curl -X GET http://localhost:5000/api/ai/insights/STUDENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Adaptive Algorithm Details

### Performance Analysis
1. **Topic-based**: Analyzes accuracy per topic from past results
2. **Difficulty-based**: Tracks performance across easy/medium/hard questions
3. **Trend Analysis**: Identifies improving/declining/stable patterns
4. **Time Analysis**: Monitors speed and efficiency

### Question Selection Strategy
1. **Priority Calculation**:
   - Weak topics: Weight 3
   - Average topics: Weight 2
   - Strong topics: Weight 1
   - Focus topics: Weight 4

2. **Difficulty Distribution**:
   - **Easy level**: 60% easy, 30% medium, 10% hard
   - **Medium level**: 30% easy, 50% medium, 20% hard
   - **Hard level**: 20% easy, 40% medium, 40% hard

3. **Topic Distribution**:
   - 50% from weak topics
   - 30% from medium topics
   - 20% from strong topics

---

## 🚀 Performance Considerations

### Question Generation
- **Average time**: 3-5 seconds per question
- **Batch size**: Recommended 5-10 questions per request
- **Rate limiting**: Apply to prevent abuse
- **Caching**: Consider caching common topics

### Ollama Resources
- **RAM Usage**: 4-8GB depending on model
- **CPU**: Multi-core recommended
- **GPU**: Optional but significantly faster

### Optimization Tips
1. Use smaller models (phi, mistral) for faster generation
2. Implement request queuing for batch operations
3. Cache frequently requested topics
4. Run Ollama on a dedicated server for production

---

## 🔐 Security Considerations

1. **Access Control**: Only Faculty/Admin can generate questions
2. **Rate Limiting**: Prevent API abuse
3. **Input Validation**: Sanitize all AI inputs
4. **Content Filtering**: Review AI-generated content before use
5. **Model Access**: Restrict model pulling to admins only

---

## 🎓 Example Workflow

### 1. Faculty Generates Questions
```javascript
// Faculty creates AI-generated questions
POST /api/ai/generate-questions
{
  topic: "Binary Search Trees",
  difficulty: "hard",
  count: 5,
  courseId: "course_123"
}
```

### 2. Student Takes Adaptive Test
```javascript
// System generates personalized assessment
POST /api/assessments/generate
{
  courseId: "course_123",
  totalQuestions: 20
}
// Uses adaptiveAssessmentService internally
```

### 3. Student Completes Test
```javascript
// Context automatically updates
POST /api/assessments/:id/submit
// Triggers contextUpdateService
```

### 4. Student Views Insights
```javascript
// Student checks their learning insights
GET /api/ai/insights/:studentId
// Shows strengths, weaknesses, recommendations
```

### 5. AI Generates Targeted Questions
```javascript
// System generates questions for weak topics
POST /api/ai/generate-for-weak-topics
{
  studentId: "student_123",
  courseId: "course_123"
}
```

---

## 📝 Future Enhancements

1. **Multi-model Support**: Switch between models based on task
2. **Fine-tuning**: Train models on domain-specific data
3. **Real-time Adaptation**: Adjust difficulty mid-assessment
4. **Collaborative Filtering**: Learn from similar students
5. **Explanation Generation**: AI-generated answer explanations
6. **Voice Integration**: Text-to-speech for questions
7. **Image Generation**: AI-generated diagrams
8. **Plagiarism Detection**: Check for copied answers

---

## 🐛 Troubleshooting

### Ollama Connection Issues
```javascript
// Check if Ollama is running
netstat -an | findstr 11434

// Restart Ollama
ollama serve
```

### Model Not Found
```bash
# List available models
ollama list

# Pull missing model
ollama pull llama2
```

### Slow Generation
- Use smaller models (phi instead of llama2)
- Reduce `max_tokens` parameter
- Enable GPU acceleration
- Increase system RAM

### Parse Errors
- Improve prompt structure
- Add more specific formatting instructions
- Implement retry logic
- Validate output before saving

---

## ✅ Integration Checklist

- [x] Ollama service installed and running
- [x] Model pulled (llama2 or mistral)
- [x] Environment variables configured
- [x] AI routes registered in server
- [x] Question generator service implemented
- [x] Adaptive assessment service implemented
- [x] Context update service implemented
- [x] API endpoints tested
- [ ] Frontend integration (Layer 4)
- [ ] Performance monitoring setup
- [ ] Error logging configured
- [ ] Production deployment planned

---

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/jmorganca/ollama)
- [LLM Best Practices](https://www.promptingguide.ai/)
- [Adaptive Learning Algorithms](https://en.wikipedia.org/wiki/Adaptive_learning)
- [Educational AI Papers](https://arxiv.org/search/cs?query=adaptive+learning)

---

**Layer 3 Implementation Complete! ✅**

Next: Implement Layer 4 (Frontend - React UI) to consume these AI services.
