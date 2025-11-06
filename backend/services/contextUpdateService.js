import User from '../models/User.js';
import Result from '../models/Result.js';

/**
 * Context Update Service - Updates student learning context
 */

class ContextUpdateService {
  /**
   * Update student context after completing an assessment
   * @param {string} studentId - Student ID
   * @param {Object} result - Completed result object
   */
  async updateStudentContext(studentId, result) {
    try {
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Calculate new context values
      const contextUpdate = this.calculateContextUpdate(student.context, result);

      // Update student context
      student.updateContext(contextUpdate);
      await student.save();

      return {
        success: true,
        updatedContext: student.context,
        changes: this.summarizeChanges(student.context, contextUpdate)
      };
    } catch (error) {
      console.error('Error updating student context:', error);
      throw new Error(`Failed to update student context: ${error.message}`);
    }
  }

  /**
   * Calculate context update based on assessment result
   */
  calculateContextUpdate(currentContext, result) {
    const update = {
      topicScores: new Map(),
      averageTimePerQuestion: 0
    };

    // Update topic scores
    if (result.topicPerformance && Array.isArray(result.topicPerformance)) {
      result.topicPerformance.forEach(tp => {
        const currentScore = currentContext.topicScores?.get(tp.topic) || 0;
        // Weighted average: 70% current, 30% new
        const newScore = Math.round(currentScore * 0.7 + tp.accuracy * 0.3);
        update.topicScores.set(tp.topic, newScore);
      });
    }

    // Update average time per question
    if (result.timeTaken && result.answers && result.answers.length > 0) {
      const currentAvgTime = currentContext.averageTimePerQuestion || 60;
      const newAvgTime = result.timeTaken / result.answers.length;
      // Weighted average: 70% current, 30% new
      update.averageTimePerQuestion = Math.round(currentAvgTime * 0.7 + newAvgTime * 0.3);
    }

    return update;
  }

  /**
   * Summarize changes made to context
   */
  summarizeChanges(context, update) {
    const changes = {
      topicsImproved: [],
      topicsDeclined: [],
      speedChange: 'stable'
    };

    // Compare topic scores
    if (update.topicScores) {
      update.topicScores.forEach((newScore, topic) => {
        const oldScore = context.topicScores?.get(topic) || 0;
        const diff = newScore - oldScore;
        
        if (diff > 10) {
          changes.topicsImproved.push({ topic, improvement: diff });
        } else if (diff < -10) {
          changes.topicsDeclined.push({ topic, decline: Math.abs(diff) });
        }
      });
    }

    // Compare speed
    if (update.averageTimePerQuestion) {
      const oldTime = context.averageTimePerQuestion || 60;
      const diff = update.averageTimePerQuestion - oldTime;
      
      if (diff < -10) {
        changes.speedChange = 'faster';
      } else if (diff > 10) {
        changes.speedChange = 'slower';
      }
    }

    return changes;
  }

  /**
   * Batch update contexts for multiple students
   */
  async batchUpdateContexts(updates) {
    const results = {
      success: [],
      failed: []
    };

    for (const { studentId, result } of updates) {
      try {
        await this.updateStudentContext(studentId, result);
        results.success.push(studentId);
      } catch (error) {
        results.failed.push({
          studentId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get student learning insights based on context
   */
  async getLearningInsights(studentId) {
    try {
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const recentResults = await Result.find({
        student: studentId,
        status: 'completed'
      })
        .sort({ submittedAt: -1 })
        .limit(10)
        .populate('assessment', 'title type course');

      const insights = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        learningStyle: this.analyzeLearningStyle(student.context, recentResults),
        progressTrend: this.analyzeProgressTrend(recentResults),
        estimatedMastery: this.calculateMasteryLevel(student.context)
      };

      // Identify strengths (topics with > 75% accuracy)
      if (student.context.topicScores) {
        student.context.topicScores.forEach((score, topic) => {
          if (score >= 75) {
            insights.strengths.push({
              topic,
              score,
              level: score >= 90 ? 'expert' : 'proficient'
            });
          } else if (score < 50) {
            insights.weaknesses.push({
              topic,
              score,
              needsWork: true
            });
          }
        });
      }

      // Generate recommendations
      insights.recommendations = this.generateRecommendations(
        insights,
        student.context,
        recentResults
      );

      return insights;
    } catch (error) {
      console.error('Error getting learning insights:', error);
      throw error;
    }
  }

  /**
   * Analyze learning style based on performance patterns
   */
  analyzeLearningStyle(context, results) {
    const style = {
      pace: 'moderate',
      consistency: 'stable',
      adaptability: 'good'
    };

    // Analyze pace
    if (context.averageTimePerQuestion < 45) {
      style.pace = 'fast';
    } else if (context.averageTimePerQuestion > 90) {
      style.pace = 'slow';
    }

    // Analyze consistency
    if (results.length >= 5) {
      const scores = results.map(r => r.score?.percentage || 0);
      const stdDev = this.calculateStandardDeviation(scores);
      
      if (stdDev < 10) {
        style.consistency = 'very consistent';
      } else if (stdDev < 20) {
        style.consistency = 'consistent';
      } else if (stdDev < 30) {
        style.consistency = 'variable';
      } else {
        style.consistency = 'inconsistent';
      }
    }

    return style;
  }

  /**
   * Analyze progress trend
   */
  analyzeProgressTrend(results) {
    if (results.length < 3) {
      return { trend: 'insufficient data', message: 'Take more assessments to see trends' };
    }

    const recentScores = results.slice(0, 5).map(r => r.score?.percentage || 0);
    const olderScores = results.slice(5, 10).map(r => r.score?.percentage || 0);

    if (olderScores.length === 0) {
      return { trend: 'new', message: 'Building your performance history' };
    }

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    const diff = recentAvg - olderAvg;

    if (diff > 15) {
      return { 
        trend: 'strong improvement', 
        message: `You've improved by ${Math.round(diff)}% recently!`,
        percentage: Math.round(diff)
      };
    } else if (diff > 5) {
      return { 
        trend: 'improving', 
        message: `Steady improvement of ${Math.round(diff)}%`,
        percentage: Math.round(diff)
      };
    } else if (diff < -15) {
      return { 
        trend: 'declining', 
        message: `Performance dropped by ${Math.round(Math.abs(diff))}%. Let's work on this.`,
        percentage: Math.round(diff)
      };
    } else if (diff < -5) {
      return { 
        trend: 'slight decline', 
        message: 'Minor drop in performance',
        percentage: Math.round(diff)
      };
    } else {
      return { 
        trend: 'stable', 
        message: 'Maintaining consistent performance',
        percentage: Math.round(diff)
      };
    }
  }

  /**
   * Calculate overall mastery level
   */
  calculateMasteryLevel(context) {
    if (!context.topicScores || context.topicScores.size === 0) {
      return {
        level: 'beginner',
        percentage: 0,
        message: 'Just getting started'
      };
    }

    const scores = Array.from(context.topicScores.values());
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    let level, message;
    if (avgScore >= 90) {
      level = 'expert';
      message = 'Excellent mastery of concepts';
    } else if (avgScore >= 75) {
      level = 'advanced';
      message = 'Strong understanding of most topics';
    } else if (avgScore >= 60) {
      level = 'intermediate';
      message = 'Good progress, keep practicing';
    } else if (avgScore >= 40) {
      level = 'developing';
      message = 'Building foundational knowledge';
    } else {
      level = 'beginner';
      message = 'Focus on core concepts';
    }

    return {
      level,
      percentage: Math.round(avgScore),
      message
    };
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(insights, context, results) {
    const recommendations = [];

    // Recommendations based on weaknesses
    if (insights.weaknesses.length > 0) {
      const topWeak = insights.weaknesses
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
      
      recommendations.push({
        type: 'focus',
        priority: 'high',
        message: `Focus on improving: ${topWeak.map(w => w.topic).join(', ')}`,
        topics: topWeak.map(w => w.topic)
      });
    }

    // Recommendations based on learning style
    if (context.averageTimePerQuestion > 120) {
      recommendations.push({
        type: 'speed',
        priority: 'medium',
        message: 'Work on improving your response time through regular practice'
      });
    }

    // Recommendations based on progress
    if (insights.progressTrend.trend === 'declining') {
      recommendations.push({
        type: 'motivation',
        priority: 'high',
        message: 'Schedule regular study sessions and take breaks to avoid burnout'
      });
    }

    // Recommendations based on consistency
    if (insights.learningStyle.consistency === 'inconsistent') {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        message: 'Maintain a regular study schedule for more consistent results'
      });
    }

    // Positive reinforcement for strengths
    if (insights.strengths.length > 0) {
      recommendations.push({
        type: 'strength',
        priority: 'low',
        message: `Great work on: ${insights.strengths.slice(0, 3).map(s => s.topic).join(', ')}!`
      });
    }

    return recommendations;
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }
}

export default new ContextUpdateService();
