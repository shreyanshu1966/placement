# AI-Powered Adaptive Assessment System

An AI-powered adaptive assessment system that generates and personalizes tests based on each student's academic progress, performance trends, and syllabus coverage — providing continuous learning insights and industry-aligned readiness for placements.

## Features

- **Course Management**: Create and manage courses with detailed syllabus breakdown
- **AI Question Generation**: Generate questions using Ollama LLaMA 3.2 based on topics and difficulty
- **Student Context Tracking**: Track student strengths, weaknesses, and performance history
- **Adaptive Assignment Generation**: Create personalized assignments based on student context
- **Real-time Analytics**: Performance tracking and insights
- **Responsive UI**: Built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React, Tailwind CSS 3.3, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: Ollama (LLaMA 3.2:1b)

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or cloud instance)
3. **Ollama** with LLaMA 3.2:1b model

### Setting up Ollama

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Pull the LLaMA 3.2:1b model:
   ```bash
   ollama pull llama3.2:1b
   ```
3. Start Ollama server:
   ```bash
   ollama serve
   ```

## Installation

1. **Clone and setup backend**:
   ```bash
   cd backend
   npm install
   ```

2. **Setup frontend**:
   ```bash
   cd frontend
   npm install
   ```

3. **Configure environment variables**:
   - Backend `.env` file is already configured with:
     ```
     MONGODB_URI=mongodb://localhost:27017/placement_system
     PORT=5000
     OLLAMA_URL=http://localhost:11434
     ```

## Running the Application

1. **Start MongoDB** (if running locally)

2. **Start Ollama server**:
   ```bash
   ollama serve
   ```

3. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

4. **Start the frontend development server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Usage

1. **Create a Course**:
   - Go to Courses → Create New Course
   - Add course title, description, faculty, and syllabus topics

2. **Generate Assignment**:
   - Go to Generate Assignment
   - Select a course and configure assignment settings
   - AI will generate personalized questions based on student context

3. **Take Assessment**:
   - Navigate to the generated assignment
   - Complete the test questions
   - Submit to see results

4. **View Analytics**:
   - Check Results page for detailed test results
   - Visit Analytics page for performance insights and recommendations

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create a new course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments/generate` - Generate new assignment
- `GET /api/assignments/:id` - Get assignment by ID
- `PUT /api/assignments/:id/start` - Start assignment

### Questions
- `POST /api/questions/generate` - Generate questions using AI

### Results
- `POST /api/results` - Submit assignment results
- `GET /api/results/student/:studentId` - Get results for student
- `GET /api/results/analytics/:studentId` - Get analytics for student

### Context
- `GET /api/context/:studentId` - Get student context
- `POST /api/context` - Update student context
- `POST /api/context/:studentId/performance` - Update performance

## Database Schema

### Course
- title, description, faculty
- syllabus: [{ topic, subtopics, difficulty }]

### Assignment
- courseId, studentId, targetTopics
- questionsGenerated: [{ question, options, correctAnswer, topic, difficulty }]
- status: generated/in-progress/completed

### Result
- assignmentId, studentId, answers, score
- topicWiseScore: [{ topic, correct, total, percentage }]
- timeSpent

### Context
- studentId, strengths, weaknesses
- performanceHistory: [{ topic, score, date }]
- learningStyle

## Features Included

✅ Course creation and management  
✅ AI-powered question generation  
✅ Student context tracking  
✅ Adaptive assignment generation  
✅ Test taking interface  
✅ Results and analytics  
✅ Responsive design with Tailwind CSS  

## MVP Limitations

- No authentication system (for MVP simplicity)
- Predefined student IDs (student-001, student-002, etc.)
- Basic AI question generation (fallback to sample questions if Ollama fails)
- No real-time updates
- No file uploads or multimedia questions

## Future Enhancements

- User authentication and authorization
- Real-time collaboration features
- Advanced AI question generation with multiple formats
- Integration with learning management systems
- Mobile app development
- Advanced analytics and reporting
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.