const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for recordings
app.use('/recordings', express.static('uploads/recordings'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/question-bank', require('./routes/questionBank'));
app.use('/api/results', require('./routes/results'));
app.use('/api/context', require('./routes/context'));
app.use('/api/students', require('./routes/students'));
app.use('/api/proctoring', require('./routes/proctoring'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});