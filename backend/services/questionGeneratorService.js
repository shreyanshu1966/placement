import ollamaService from './ollamaService.js';
import Question from '../models/Question.js';

/**
 * Question Generation Service - AI-powered question generation
 */

class QuestionGeneratorService {
  /**
   * Generate questions for a specific topic using AI
   * @param {Object} config - Generation configuration
   * @returns {Promise<Array>} Generated questions
   */
  async generateQuestions(config) {
    const {
      topic,
      difficulty = 'medium',
      count = 5,
      questionType = 'multiple-choice',
      course,
      context = ''
    } = config;

    try {
      const prompt = this.buildPrompt(topic, difficulty, count, questionType, context);
      const response = await ollamaService.generate(prompt, {
        temperature: 0.7,
        max_tokens: 2000
      });

      // Parse the generated questions
      const questions = this.parseGeneratedQuestions(response, {
        topic,
        difficulty,
        questionType,
        course
      });

      return questions;
    } catch (error) {
      console.error('Question generation error:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  /**
   * Build prompt for question generation
   */
  buildPrompt(topic, difficulty, count, questionType, context) {
    const difficultyGuide = {
      easy: 'basic concepts and definitions',
      medium: 'practical applications and problem-solving',
      hard: 'complex scenarios, edge cases, and advanced concepts'
    };

    let prompt = `You are an expert educator creating assessment questions.

Topic: ${topic}
Difficulty Level: ${difficulty} (${difficultyGuide[difficulty]})
Question Type: ${questionType}
Number of Questions: ${count}
${context ? `Additional Context: ${context}` : ''}

Generate ${count} high-quality ${questionType} questions about ${topic} at ${difficulty} difficulty level.

`;

    if (questionType === 'multiple-choice') {
      prompt += `
For each question, provide:
1. Question text (clear and concise)
2. Four options (A, B, C, D)
3. Correct answer (letter)
4. Explanation (why the answer is correct)

Format each question as:
Q: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [Letter]
Explanation: [Brief explanation]
Marks: [Appropriate marks based on difficulty: easy=1, medium=2, hard=3]
---
`;
    } else if (questionType === 'true-false') {
      prompt += `
For each question, provide:
1. Statement
2. Correct answer (True or False)
3. Explanation

Format each question as:
Q: [Statement]
Correct: [True/False]
Explanation: [Brief explanation]
Marks: 1
---
`;
    } else if (questionType === 'short-answer') {
      prompt += `
For each question, provide:
1. Question text
2. Sample correct answer
3. Key points that should be included

Format each question as:
Q: [Question text]
Answer: [Sample correct answer]
Key Points: [List of key points]
Marks: [2-5 based on difficulty]
---
`;
    }

    return prompt;
  }

  /**
   * Parse AI-generated questions into structured format
   */
  parseGeneratedQuestions(response, metadata) {
    const questions = [];
    const questionBlocks = response.split('---').filter(block => block.trim());

    for (const block of questionBlocks) {
      try {
        const question = this.parseQuestionBlock(block, metadata);
        if (question) {
          questions.push(question);
        }
      } catch (error) {
        console.error('Error parsing question block:', error);
      }
    }

    return questions;
  }

  /**
   * Parse individual question block
   */
  parseQuestionBlock(block, metadata) {
    const lines = block.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    const question = {
      ...metadata,
      tags: [metadata.topic, metadata.difficulty, 'ai-generated']
    };

    // Extract question text
    const qLine = lines.find(l => l.trim().startsWith('Q:'));
    if (qLine) {
      question.questionText = qLine.replace(/^Q:\s*/, '').trim();
    }

    if (metadata.questionType === 'multiple-choice') {
      question.options = [];
      
      // Extract options
      for (const line of lines) {
        const optionMatch = line.match(/^([A-D])\)\s*(.+)$/);
        if (optionMatch) {
          question.options.push({
            text: optionMatch[2].trim(),
            isCorrect: false
          });
        }
      }

      // Mark correct answer
      const correctLine = lines.find(l => l.trim().startsWith('Correct:'));
      if (correctLine) {
        const correctLetter = correctLine.replace(/^Correct:\s*/, '').trim()[0].toUpperCase();
        const correctIndex = correctLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
        if (question.options[correctIndex]) {
          question.options[correctIndex].isCorrect = true;
          question.correctAnswer = question.options[correctIndex].text;
        }
      }
    } else if (metadata.questionType === 'true-false') {
      const correctLine = lines.find(l => l.trim().startsWith('Correct:'));
      if (correctLine) {
        question.correctAnswer = correctLine.replace(/^Correct:\s*/, '').trim();
      }
    } else if (metadata.questionType === 'short-answer') {
      const answerLine = lines.find(l => l.trim().startsWith('Answer:'));
      if (answerLine) {
        question.correctAnswer = answerLine.replace(/^Answer:\s*/, '').trim();
      }

      const keyPointsLine = lines.find(l => l.trim().startsWith('Key Points:'));
      if (keyPointsLine) {
        question.keyPoints = keyPointsLine.replace(/^Key Points:\s*/, '').trim();
      }
    }

    // Extract explanation
    const explanationLine = lines.find(l => l.trim().startsWith('Explanation:'));
    if (explanationLine) {
      question.explanation = explanationLine.replace(/^Explanation:\s*/, '').trim();
    }

    // Extract marks
    const marksLine = lines.find(l => l.trim().startsWith('Marks:'));
    if (marksLine) {
      question.marks = parseInt(marksLine.replace(/^Marks:\s*/, '').trim()) || 2;
    } else {
      // Default marks based on difficulty
      question.marks = metadata.difficulty === 'easy' ? 1 : metadata.difficulty === 'medium' ? 2 : 3;
    }

    return question.questionText ? question : null;
  }

  /**
   * Generate and save questions to database
   * @param {Object} config - Generation configuration
   * @returns {Promise<Object>} Result with saved questions
   */
  async generateAndSave(config) {
    try {
      const questions = await this.generateQuestions(config);
      const savedQuestions = [];
      const errors = [];

      for (const questionData of questions) {
        try {
          const question = new Question(questionData);
          await question.save();
          savedQuestions.push(question);
        } catch (error) {
          errors.push({
            question: questionData.questionText?.substring(0, 50),
            error: error.message
          });
        }
      }

      return {
        success: true,
        generated: questions.length,
        saved: savedQuestions.length,
        failed: errors.length,
        questions: savedQuestions,
        errors
      };
    } catch (error) {
      throw new Error(`Failed to generate and save questions: ${error.message}`);
    }
  }

  /**
   * Generate questions based on weak topics
   * @param {Array} weakTopics - List of weak topics
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} Generated questions
   */
  async generateForWeakTopics(weakTopics, courseId) {
    const allQuestions = [];

    for (const topic of weakTopics) {
      const questions = await this.generateQuestions({
        topic,
        difficulty: 'medium',
        count: 3,
        questionType: 'multiple-choice',
        course: courseId,
        context: 'Focus on common mistakes and misunderstandings'
      });

      allQuestions.push(...questions);
    }

    return allQuestions;
  }

  /**
   * Enhance existing question with AI
   * @param {Object} question - Original question
   * @returns {Promise<Object>} Enhanced question
   */
  async enhanceQuestion(question) {
    const prompt = `Improve the following assessment question by:
1. Making it clearer and more precise
2. Ensuring the correct answer is definitively correct
3. Making distractors (wrong answers) more challenging but clearly incorrect
4. Improving the explanation

Original Question:
${question.questionText}

Type: ${question.questionType}
Difficulty: ${question.difficulty}
${question.options ? 'Options: ' + question.options.map((o, i) => `${i + 1}. ${o.text} ${o.isCorrect ? '(correct)' : ''}`).join(', ') : ''}

Provide the enhanced version in the same format.`;

    const response = await ollamaService.generate(prompt, {
      temperature: 0.5,
      max_tokens: 500
    });

    return this.parseQuestionBlock(response, {
      topic: question.topic,
      difficulty: question.difficulty,
      questionType: question.questionType,
      course: question.course
    });
  }
}

export default new QuestionGeneratorService();
