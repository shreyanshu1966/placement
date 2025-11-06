import User from '../models/User.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';

/**
 * Adaptive Assessment Service - Generates personalized assessments
 */

class AdaptiveAssessmentService {
  /**
   * Generate adaptive assessment based on student context
   * @param {string} studentId - Student ID
   * @param {string} courseId - Course ID
   * @param {Object} config - Assessment configuration
   * @returns {Promise<Object>} Selected questions and metadata
   */
  async generateAdaptiveAssessment(studentId, courseId, config) {
    try {
      // Get student context
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Analyze student's past performance
      const analysis = await this.analyzeStudentPerformance(studentId, courseId);

      // Select questions based on analysis
      const questions = await this.selectAdaptiveQuestions(
        courseId,
        analysis,
        config
      );

      return {
        questions,
        analysis,
        studentContext: student.context
      };
    } catch (error) {
      throw new Error(`Failed to generate adaptive assessment: ${error.message}`);
    }
  }

  /**
   * Analyze student's performance history
   */
  async analyzeStudentPerformance(studentId, courseId) {
    try {
      // Get all completed results for this student and course
      const results = await Result.find({
        student: studentId,
        status: 'completed'
      })
        .populate({
          path: 'assessment',
          match: { course: courseId },
          populate: { path: 'course' }
        })
        .sort({ submittedAt: -1 })
        .limit(10);

      // Filter out results where assessment is null (different course)
      const relevantResults = results.filter(r => r.assessment);

      if (relevantResults.length === 0) {
        return this.getDefaultAnalysis();
      }

      // Aggregate topic performance
      const topicPerformance = new Map();
      const difficultyPerformance = {
        easy: { attempted: 0, correct: 0, accuracy: 0 },
        medium: { attempted: 0, correct: 0, accuracy: 0 },
        hard: { attempted: 0, correct: 0, accuracy: 0 }
      };

      for (const result of relevantResults) {
        // Topic performance
        if (result.topicPerformance && Array.isArray(result.topicPerformance)) {
          result.topicPerformance.forEach(tp => {
            if (!topicPerformance.has(tp.topic)) {
              topicPerformance.set(tp.topic, {
                topic: tp.topic,
                totalAttempted: 0,
                totalCorrect: 0,
                attempts: []
              });
            }
            const data = topicPerformance.get(tp.topic);
            data.totalAttempted += tp.questionsAttempted || 0;
            data.totalCorrect += tp.correctAnswers || 0;
            data.attempts.push(tp.accuracy || 0);
          });
        }

        // Difficulty performance
        if (result.difficultyPerformance) {
          ['easy', 'medium', 'hard'].forEach(level => {
            const perf = result.difficultyPerformance[level];
            if (perf) {
              difficultyPerformance[level].attempted += perf.attempted || 0;
              difficultyPerformance[level].correct += perf.correct || 0;
            }
          });
        }
      }

      // Calculate topic accuracies and identify weak areas
      const topicStats = Array.from(topicPerformance.values()).map(data => {
        const accuracy = data.totalAttempted > 0
          ? Math.round((data.totalCorrect / data.totalAttempted) * 100)
          : 0;
        
        const recentAccuracy = data.attempts.length > 0
          ? data.attempts.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, data.attempts.length)
          : 0;

        return {
          topic: data.topic,
          accuracy,
          recentAccuracy,
          totalAttempted: data.totalAttempted,
          status: accuracy >= 70 ? 'strong' : accuracy >= 50 ? 'average' : 'weak',
          trend: this.calculateTrend(data.attempts)
        };
      });

      // Sort topics by priority (weak topics first)
      const weakTopics = topicStats
        .filter(t => t.status === 'weak' || t.status === 'average')
        .sort((a, b) => a.accuracy - b.accuracy)
        .map(t => t.topic);

      const strongTopics = topicStats
        .filter(t => t.status === 'strong')
        .map(t => t.topic);

      // Calculate difficulty accuracies
      ['easy', 'medium', 'hard'].forEach(level => {
        const perf = difficultyPerformance[level];
        perf.accuracy = perf.attempted > 0
          ? Math.round((perf.correct / perf.attempted) * 100)
          : 0;
      });

      // Determine optimal difficulty level
      const optimalDifficulty = this.determineOptimalDifficulty(difficultyPerformance);

      return {
        topicStats,
        weakTopics,
        strongTopics,
        difficultyPerformance,
        optimalDifficulty,
        totalAttempts: relevantResults.length,
        averageScore: relevantResults.reduce((sum, r) => sum + (r.score?.percentage || 0), 0) / relevantResults.length,
        recentTrend: this.calculateOverallTrend(relevantResults)
      };
    } catch (error) {
      console.error('Error analyzing student performance:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Get default analysis for new students
   */
  getDefaultAnalysis() {
    return {
      topicStats: [],
      weakTopics: [],
      strongTopics: [],
      difficultyPerformance: {
        easy: { attempted: 0, correct: 0, accuracy: 0 },
        medium: { attempted: 0, correct: 0, accuracy: 0 },
        hard: { attempted: 0, correct: 0, accuracy: 0 }
      },
      optimalDifficulty: 'medium',
      totalAttempts: 0,
      averageScore: 0,
      recentTrend: 'new'
    };
  }

  /**
   * Calculate trend from attempts array
   */
  calculateTrend(attempts) {
    if (attempts.length < 2) return 'stable';
    
    const recent = attempts.slice(0, 3);
    const older = attempts.slice(3, 6);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 10) return 'improving';
    if (diff < -10) return 'declining';
    return 'stable';
  }

  /**
   * Calculate overall performance trend
   */
  calculateOverallTrend(results) {
    if (results.length < 2) return 'new';
    
    const recent = results.slice(0, 3).map(r => r.score?.percentage || 0);
    const older = results.slice(3, 6).map(r => r.score?.percentage || 0);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 10) return 'improving';
    if (diff < -10) return 'declining';
    return 'stable';
  }

  /**
   * Determine optimal difficulty level
   */
  determineOptimalDifficulty(difficultyPerformance) {
    const easyAcc = difficultyPerformance.easy.accuracy;
    const mediumAcc = difficultyPerformance.medium.accuracy;
    const hardAcc = difficultyPerformance.hard.accuracy;

    // If no attempts yet, start with medium
    if (difficultyPerformance.easy.attempted === 0) return 'medium';

    // If struggling with easy, stay at easy
    if (easyAcc < 60) return 'easy';

    // If mastering easy but struggling with medium
    if (easyAcc >= 80 && mediumAcc < 60) return 'medium';

    // If doing well in medium, try hard
    if (mediumAcc >= 75) return 'hard';

    // Default to medium
    return 'medium';
  }

  /**
   * Select adaptive questions based on analysis
   */
  async selectAdaptiveQuestions(courseId, analysis, config) {
    const {
      totalQuestions = 10,
      focusTopics = [],
      difficultyDistribution = null
    } = config;

    try {
      // Determine question distribution
      const distribution = difficultyDistribution || this.calculateDistribution(
        totalQuestions,
        analysis.optimalDifficulty
      );

      // Determine topic priorities
      const topicPriorities = this.calculateTopicPriorities(
        analysis,
        focusTopics
      );

      // Fetch questions from database
      const selectedQuestions = [];

      for (const [difficulty, count] of Object.entries(distribution)) {
        const questions = await this.fetchQuestionsByPriority(
          courseId,
          difficulty,
          topicPriorities,
          count
        );
        selectedQuestions.push(...questions);
      }

      // Shuffle questions to avoid pattern recognition
      this.shuffleArray(selectedQuestions);

      return selectedQuestions.slice(0, totalQuestions);
    } catch (error) {
      console.error('Error selecting adaptive questions:', error);
      throw error;
    }
  }

  /**
   * Calculate difficulty distribution
   */
  calculateDistribution(totalQuestions, optimalDifficulty) {
    const distributions = {
      easy: {
        easy: Math.ceil(totalQuestions * 0.6),
        medium: Math.ceil(totalQuestions * 0.3),
        hard: Math.floor(totalQuestions * 0.1)
      },
      medium: {
        easy: Math.ceil(totalQuestions * 0.3),
        medium: Math.ceil(totalQuestions * 0.5),
        hard: Math.floor(totalQuestions * 0.2)
      },
      hard: {
        easy: Math.ceil(totalQuestions * 0.2),
        medium: Math.ceil(totalQuestions * 0.4),
        hard: Math.floor(totalQuestions * 0.4)
      }
    };

    return distributions[optimalDifficulty] || distributions.medium;
  }

  /**
   * Calculate topic priorities for question selection
   */
  calculateTopicPriorities(analysis, focusTopics) {
    const priorities = new Map();

    // High priority for weak topics (weight: 3)
    analysis.weakTopics.forEach(topic => {
      priorities.set(topic, 3);
    });

    // Medium priority for average topics (weight: 2)
    analysis.topicStats
      .filter(t => t.status === 'average')
      .forEach(t => {
        if (!priorities.has(t.topic)) {
          priorities.set(t.topic, 2);
        }
      });

    // Low priority for strong topics (weight: 1)
    analysis.strongTopics.forEach(topic => {
      if (!priorities.has(topic)) {
        priorities.set(topic, 1);
      }
    });

    // Override priority for focus topics (weight: 4)
    focusTopics.forEach(topic => {
      priorities.set(topic, 4);
    });

    return priorities;
  }

  /**
   * Fetch questions based on priority
   */
  async fetchQuestionsByPriority(courseId, difficulty, topicPriorities, count) {
    // Sort topics by priority
    const sortedTopics = Array.from(topicPriorities.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);

    const questions = [];
    const usedQuestions = new Set();

    // Try to get questions from high-priority topics first
    for (const topic of sortedTopics) {
      if (questions.length >= count) break;

      const topicQuestions = await Question.find({
        course: courseId,
        topic,
        difficulty,
        _id: { $nin: Array.from(usedQuestions) }
      }).limit(count - questions.length);

      topicQuestions.forEach(q => {
        questions.push(q);
        usedQuestions.add(q._id);
      });
    }

    // If still need more questions, fetch from any topic
    if (questions.length < count) {
      const remainingQuestions = await Question.find({
        course: courseId,
        difficulty,
        _id: { $nin: Array.from(usedQuestions) }
      }).limit(count - questions.length);

      questions.push(...remainingQuestions);
    }

    return questions;
  }

  /**
   * Shuffle array in place
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export default new AdaptiveAssessmentService();
