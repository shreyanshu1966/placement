# Getting Started Instructions

## Prerequisites Check

Before running the application, make sure you have:

1. ✅ **MongoDB** running on localhost:27017
2. ✅ **Ollama** installed and running with llama3.2:1b model
3. ✅ **Node.js** installed (v14+)

## Starting the Application

### Step 1: Start MongoDB
Make sure MongoDB is running on your local machine at `mongodb://localhost:27017`

### Step 2: Start Ollama (for AI question generation)
```bash
# Pull the model if not already done
ollama pull llama3.2:1b

# Start Ollama server
ollama serve
```

### Step 3: Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: http://localhost:5000

### Step 4: Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

## Current Status

✅ **Backend**: Running on port 5000  
✅ **Frontend**: Running on port 5173  
✅ **Database**: Seeded with sample data  
✅ **API Routes**: All endpoints configured  

## Sample Data Available

### Courses:
1. **Data Structures and Algorithms** (5 topics)
2. **Web Development Fundamentals** (4 topics)  
3. **Database Management Systems** (3 topics)

### Students:
- student-001 (Strengths: HTML/CSS, JavaScript; Weaknesses: Dynamic Programming, Trees)
- student-002 (Strengths: SQL, Database; Weaknesses: React.js, Node.js)
- student-003 (Strengths: Arrays, Linked Lists; Weaknesses: Database Design, JavaScript)

## Quick Test Workflow

1. **Visit the homepage**: http://localhost:5173
2. **View courses**: Navigate to Courses page 
3. **Generate assignment**: 
   - Go to Generate Assignment
   - Select a course (e.g., "Data Structures and Algorithms")
   - Choose student-001
   - Click Generate Assignment
4. **Take test**: Complete the generated questions
5. **View results**: See detailed results and analytics

## Features Working

✅ Course creation and management  
✅ AI question generation (with Ollama fallback)  
✅ Student context tracking  
✅ Assignment generation  
✅ Test taking interface  
✅ Results and analytics  
✅ Responsive design with Tailwind CSS  

## Troubleshooting

**If questions don't generate properly:**
- Make sure Ollama is running: `ollama serve`
- The system will fall back to sample questions if Ollama is unavailable

**If MongoDB connection fails:**
- Make sure MongoDB is running on port 27017
- Check if the database `placement_system` exists

**If frontend doesn't load:**
- Make sure all npm packages are installed
- Check browser console for any errors

## API Endpoints Available

- GET /api/courses - List all courses
- POST /api/assignments/generate - Generate new assignment
- GET /api/results/analytics/:studentId - Get student analytics
- GET /api/context/:studentId - Get student learning context

The system is now ready for testing! 🚀