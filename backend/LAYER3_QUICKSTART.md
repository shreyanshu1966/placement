# 🚀 Quick Start Guide - Layer 3 (AI Intelligence)

## Prerequisites
- ✅ Layer 1 & 2 completed (Backend running)
- ✅ MongoDB connected
- ✅ Node.js installed (v18+)

## Step-by-Step Setup

### 1️⃣ Install Ollama

**Option A: Windows**
```powershell
# Download and run installer from:
https://ollama.ai/download/windows
```

**Option B: Linux/macOS**
```bash
# Install via script
curl https://ollama.ai/install.sh | sh
```

### 2️⃣ Verify Ollama Installation
```bash
ollama --version
```

### 3️⃣ Pull a Model
```bash
# Recommended: llama2 (3.8GB)
ollama pull llama2

# Alternative: mistral (faster, 4.1GB)
ollama pull mistral

# Lightweight: phi (1.6GB)
ollama pull phi
```

### 4️⃣ Start Ollama Service
```bash
# Start in a separate terminal
ollama serve

# Should see: "Ollama is running on http://localhost:11434"
```

### 5️⃣ Configure Environment
```bash
# Copy .env.example if you haven't already
cp .env.example .env

# Add these lines to .env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 6️⃣ Test AI Services
```bash
# Run automated tests
npm run test:ai
```

Expected output:
```
✅ Ollama Connection       PASS
✅ Text Generation         PASS
✅ Chat Completion         PASS
✅ Question Generation     PASS

🎉 All tests passed! (4/4)
```

### 7️⃣ Start Backend Server
```bash
npm run dev
```

Server should start with Layer 3 routes registered:
```
🚀 Server running in development mode on port 5000
📍 API: http://localhost:5000
🏥 Health: http://localhost:5000/health
```

---

## 🧪 Testing AI Endpoints

### Test 1: Check AI Status
```bash
# Using curl (PowerShell)
curl -X GET http://localhost:5000/api/ai/status `
  -H "Authorization: Bearer YOUR_FACULTY_TOKEN"

# Or using PowerShell's Invoke-RestMethod
$token = "YOUR_FACULTY_TOKEN"
Invoke-RestMethod -Uri "http://localhost:5000/api/ai/status" `
  -Headers @{Authorization="Bearer $token"}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "available": true,
    "models": [
      {
        "name": "llama2",
        "size": "3825819519",
        "modified": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Test 2: Generate Questions
```bash
# First, get a faculty token by logging in
$loginBody = @{
  email = "faculty@college.edu"
  password = "faculty123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body $loginBody `
  -ContentType "application/json"

$token = $loginResponse.token

# Now generate questions
$questionBody = @{
  topic = "Arrays"
  difficulty = "medium"
  count = 2
  questionType = "multiple-choice"
  course = "YOUR_COURSE_ID"
  saveToDatabase = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/generate-questions" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -Body $questionBody `
  -ContentType "application/json"
```

### Test 3: Chat with AI
```bash
$chatBody = @{
  message = "Explain binary search in simple terms"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/chat" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -Body $chatBody `
  -ContentType "application/json"
```

---

## 📚 Available AI Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/ai/status` | GET | Faculty/Admin | Check Ollama status |
| `/api/ai/generate-questions` | POST | Faculty/Admin | Generate questions |
| `/api/ai/generate-for-weak-topics` | POST | Faculty/Admin | Target weak areas |
| `/api/ai/enhance-question/:id` | POST | Faculty/Admin | Improve question |
| `/api/ai/insights/:studentId` | GET | All | Get learning insights |
| `/api/ai/chat` | POST | All | Chat with AI |
| `/api/ai/pull-model` | POST | Admin | Download model |

---

## 🔍 Troubleshooting

### Issue: Ollama not found
```bash
# Check if installed
ollama --version

# If not found, reinstall
# Windows: Download from https://ollama.ai/download
# Linux: curl https://ollama.ai/install.sh | sh
```

### Issue: Connection refused on port 11434
```bash
# Check if Ollama service is running
netstat -an | findstr 11434

# If not running, start it
ollama serve
```

### Issue: Model not found
```bash
# List installed models
ollama list

# Pull missing model
ollama pull llama2
```

### Issue: Slow generation
- **Solution 1**: Use a smaller model (phi instead of llama2)
- **Solution 2**: Reduce `max_tokens` in requests
- **Solution 3**: Enable GPU if available
- **Solution 4**: Close other heavy applications

### Issue: Parse errors in questions
- **Cause**: LLM output format varies
- **Solution**: The parser is flexible, but you may need to adjust prompts
- **Tip**: Set `saveToDatabase: false` when testing

---

## 🎯 Common Use Cases

### Use Case 1: Generate Practice Questions
```javascript
POST /api/ai/generate-questions
{
  "topic": "Binary Trees",
  "difficulty": "hard",
  "count": 5,
  "questionType": "multiple-choice",
  "course": "course_id",
  "context": "Focus on traversal algorithms",
  "saveToDatabase": true
}
```

### Use Case 2: Help Student with Concept
```javascript
POST /api/ai/chat
{
  "message": "I don't understand recursion. Can you explain with an example?",
  "context": [
    {
      "role": "user",
      "content": "I'm learning about functions"
    }
  ]
}
```

### Use Case 3: Analyze Student Performance
```javascript
GET /api/ai/insights/:studentId

Response:
{
  "strengths": ["Arrays", "Sorting"],
  "weaknesses": ["Trees", "Graphs"],
  "recommendations": [
    {
      "type": "focus",
      "message": "Focus on improving: Trees, Graphs"
    }
  ],
  "progressTrend": {
    "trend": "improving",
    "percentage": 15
  }
}
```

---

## 📊 Performance Tips

1. **Model Selection**
   - Use `llama2` for quality (slower)
   - Use `mistral` for speed
   - Use `phi` for resource-constrained systems

2. **Request Optimization**
   - Batch similar requests together
   - Cache frequently requested topics
   - Use lower temperatures for consistent output

3. **Resource Management**
   - Ollama uses 4-8GB RAM
   - Close other applications during generation
   - Consider dedicated AI server for production

---

## ✅ Verification Checklist

Before proceeding to Layer 4:
- [ ] Ollama installed and running
- [ ] Model pulled (llama2 recommended)
- [ ] `npm run test:ai` passes all tests
- [ ] Backend server starts without errors
- [ ] Can check AI status via API
- [ ] Can generate questions via API
- [ ] Can chat with AI via API
- [ ] Learning insights work correctly

---

## 🎉 Success!

If all tests pass, you're ready for **Layer 4 (Frontend)**!

Next steps:
1. Start building React components
2. Create student dashboard UI
3. Implement test-taking interface
4. Add analytics visualizations

---

## 📖 Additional Resources

- [Full Layer 3 Documentation](./LAYER3_AI_IMPLEMENTATION.md)
- [Ollama Documentation](https://github.com/jmorganca/ollama)
- [Model List](https://ollama.ai/library)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Questions or Issues?**
Check the [Troubleshooting](#-troubleshooting) section or review the full documentation.
