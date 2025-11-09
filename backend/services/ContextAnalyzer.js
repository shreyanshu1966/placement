const Context = require('../models/Context');

class ContextAnalyzer {
  
  // Analyze student performance and automatically update context
  static async analyzeAndUpdateContext(studentId, testResults) {
    try {
      let context = await Context.findOne({ studentId });
      
      if (!context) {
        context = new Context({
          studentId,
          strengths: [],
          weaknesses: [],
          performanceHistory: []
        });
      }

      // Add new performance record
      testResults.topicWiseScore.forEach(topicScore => {
        context.performanceHistory.push({
          topic: topicScore.topic,
          score: topicScore.percentage,
          date: new Date()
        });
      });

      // Analyze strengths and weaknesses
      const topicAnalysis = this.analyzeTopicPerformance(context.performanceHistory);
      
      // Update strengths (topics with average score >= 75%)
      context.strengths = topicAnalysis
        .filter(topic => topic.averageScore >= 75)
        .map(topic => topic.name);

      // Update weaknesses (topics with average score < 60%)
      context.weaknesses = topicAnalysis
        .filter(topic => topic.averageScore < 60)
        .map(topic => topic.name);

      // Determine learning style based on performance patterns
      context.learningStyle = this.determineLearningStyle(context.performanceHistory);
      
      context.lastUpdated = new Date();
      await context.save();

      return context;
    } catch (error) {
      console.error('Error analyzing context:', error);
      throw error;
    }
  }

  // Analyze topic performance over time
  static analyzeTopicPerformance(performanceHistory) {
    const topicStats = {};

    performanceHistory.forEach(record => {
      if (!topicStats[record.topic]) {
        topicStats[record.topic] = {
          name: record.topic,
          scores: [],
          totalAttempts: 0
        };
      }
      topicStats[record.topic].scores.push(record.score);
      topicStats[record.topic].totalAttempts++;
    });

    return Object.values(topicStats).map(topic => ({
      name: topic.name,
      averageScore: topic.scores.reduce((sum, score) => sum + score, 0) / topic.scores.length,
      totalAttempts: topic.totalAttempts,
      trend: this.calculateTrend(topic.scores),
      consistency: this.calculateConsistency(topic.scores)
    }));
  }

  // Calculate performance trend (improving, declining, stable)
  static calculateTrend(scores) {
    if (scores.length < 2) return 'insufficient_data';
    
    const recentScores = scores.slice(-3);
    const olderScores = scores.slice(0, -3);
    
    if (olderScores.length === 0) return 'insufficient_data';
    
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  // Calculate performance consistency
  static calculateConsistency(scores) {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 100 - standardDeviation);
  }

  // Determine learning style based on performance patterns
  static determineLearningStyle(performanceHistory) {
    // Simple heuristic - can be made more sophisticated
    const recentPerformances = performanceHistory.slice(-10);
    const averageScore = recentPerformances.reduce((sum, p) => sum + p.score, 0) / recentPerformances.length;
    
    if (averageScore >= 80) return 'visual'; // High performers often visual learners
    if (averageScore >= 60) return 'kinesthetic'; // Medium performers often hands-on learners
    return 'auditory'; // Lower performers might benefit from auditory learning
  }

  // Get next test recommendation based on context
  static async getTestRecommendation(studentId) {
    try {
      const context = await Context.findOne({ studentId });
      
      if (!context) {
        return {
          focusAreas: [],
          difficulty: 'medium',
          recommendedTopics: [],
          reason: 'No performance history available'
        };
      }

      // Prioritize weak areas
      const focusAreas = context.weaknesses.length > 0 ? context.weaknesses : context.strengths;
      
      // Determine difficulty based on recent performance
      const recentPerformances = context.performanceHistory.slice(-5);
      const recentAverage = recentPerformances.length > 0 
        ? recentPerformances.reduce((sum, p) => sum + p.score, 0) / recentPerformances.length 
        : 50;

      let difficulty = 'medium';
      if (recentAverage < 50) difficulty = 'easy';
      else if (recentAverage > 75) difficulty = 'hard';

      return {
        focusAreas,
        difficulty,
        recommendedTopics: focusAreas.slice(0, 3), // Focus on top 3 areas
        reason: context.weaknesses.length > 0 
          ? 'Focusing on weak areas for improvement'
          : 'Reinforcing strong areas and introducing new challenges'
      };
    } catch (error) {
      console.error('Error getting test recommendation:', error);
      throw error;
    }
  }
}

module.exports = ContextAnalyzer;