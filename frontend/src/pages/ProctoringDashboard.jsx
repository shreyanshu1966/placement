import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { proctoringService } from '../services/proctoringService';
import { assignmentAPI } from '../services/api';

const ProctoringDashboard = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    riskLevel: ''
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
  }, [assignmentId, filters]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLiveData, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, assignmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentData, sessionsData, analyticsData] = await Promise.all([
        assignmentAPI.getById(assignmentId),
        proctoringService.getAssignmentSessions(assignmentId, filters),
        proctoringService.getAnalyticsSummary(assignmentId)
      ]);

      setAssignment(assignmentData.data);
      setSessions(sessionsData.sessions);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching proctoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const liveData = await proctoringService.getLiveMonitoring(assignmentId);
      setLiveData(liveData);
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const handleSessionSelect = async (sessionId) => {
    try {
      const sessionData = await proctoringService.getSessionDetails(sessionId);
      setSelectedSession(sessionData);
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  const handleReviewSubmit = async (sessionId, reviewData) => {
    try {
      await proctoringService.submitReview(sessionId, {
        reviewerId: 'faculty-001', // Should come from auth context
        ...reviewData
      });
      
      // Refresh data
      fetchData();
      setSelectedSession(null);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      case 'flagged': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proctoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proctoring Dashboard</h1>
              <p className="text-gray-600 mt-1">{assignment?.title}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg border ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}
              >
                {autoRefresh ? '🔄 Auto Refresh ON' : '⏸️ Auto Refresh OFF'}
              </button>
              <button
                onClick={fetchData}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Live Monitoring Alert */}
        {liveData && liveData.activeSessions > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
              <span className="font-medium text-blue-800">
                🔴 LIVE: {liveData.activeSessions} active test sessions being monitored
              </span>
            </div>
          </div>
        )}

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-900">{analytics.summary.totalSessions}</div>
              <div className="text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{analytics.summary.completedSessions}</div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-orange-600">{analytics.summary.flaggedSessions}</div>
              <div className="text-gray-600">Flagged</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(analytics.summary.averageSecurityScore)}%
              </div>
              <div className="text-gray-600">Avg Security Score</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Proctoring Sessions</h2>
                  
                  {/* Filters */}
                  <div className="flex space-x-3">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="terminated">Terminated</option>
                      <option value="flagged">Flagged</option>
                    </select>
                    <select
                      value={filters.riskLevel}
                      onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      <option value="">All Risk Levels</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSessionSelect(session.sessionId)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium">{session.studentId}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(session.riskLevel)}`}>
                            {session.riskLevel} risk
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Started: {new Date(session.startTime).toLocaleString()}</div>
                          {session.duration && (
                            <div>Duration: {formatDuration(session.duration)}</div>
                          )}
                          <div>Suspicious Activities: {session.suspiciousActivityCount}</div>
                          <div>Security Score: {session.securityScore}%</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {session.status === 'active' && (
                          <div className="flex items-center text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                            LIVE
                          </div>
                        )}
                        {session.finalDecision && (
                          <div className={`text-sm font-medium ${
                            session.finalDecision === 'approved' ? 'text-green-600' : 
                            session.finalDecision === 'flagged' ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {session.finalDecision.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No proctoring sessions found
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <SessionDetailsPanel 
                session={selectedSession}
                onReviewSubmit={handleReviewSubmit}
                onClose={() => setSelectedSession(null)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                <p className="text-gray-500 text-center">
                  Select a session to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Session Details Panel Component
const SessionDetailsPanel = ({ session, onReviewSubmit, onClose }) => {
  const [reviewData, setReviewData] = useState({
    decision: 'approved',
    notes: '',
    overallRating: 8
  });

  const handleSubmitReview = () => {
    onReviewSubmit(session.sessionId, reviewData);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Session Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Basic Info */}
        <div>
          <h4 className="font-medium mb-2">Basic Information</h4>
          <div className="text-sm space-y-1">
            <div>Student: {session.studentId}</div>
            <div>Status: <span className="font-medium">{session.status}</span></div>
            <div>Risk Level: <span className="font-medium">{session.riskLevel}</span></div>
            <div>Security Score: <span className="font-medium">{session.securityScore}%</span></div>
          </div>
        </div>

        {/* Suspicious Activities */}
        <div>
          <h4 className="font-medium mb-2">Suspicious Activities ({session.suspiciousActivities.length})</h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {session.suspiciousActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{activity.type.replace('_', ' ')}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    activity.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    activity.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {activity.severity}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">{activity.details}</div>
                <div className="text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        {session.aiAnalysis && (
          <div>
            <h4 className="font-medium mb-2">AI Analysis</h4>
            <div className="text-xs space-y-1">
              {session.aiAnalysis.behaviorAnalysis && (
                <div>
                  Behavior: {session.aiAnalysis.behaviorAnalysis.normalBehavior ? '✅ Normal' : '⚠️ Suspicious'}
                </div>
              )}
              {session.aiAnalysis.faceRecognition && (
                <div>
                  Identity: {session.aiAnalysis.faceRecognition.identityVerified ? '✅ Verified' : '❌ Not Verified'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recordings */}
        {session.recordings && (
          <div>
            <h4 className="font-medium mb-2">Recordings</h4>
            <div className="text-xs space-y-1">
              {session.recordings.webcam?.enabled && (
                <div>Webcam: {session.recordings.webcam.chunks.length} chunks</div>
              )}
              {session.recordings.screen?.enabled && (
                <div>Screen: {session.recordings.screen.chunks.length} chunks</div>
              )}
            </div>
          </div>
        )}

        {/* Review Form */}
        {!session.proctorReview && session.status !== 'active' && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Proctor Review</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Decision</label>
                <select
                  value={reviewData.decision}
                  onChange={(e) => setReviewData({...reviewData, decision: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="approved">Approved</option>
                  <option value="flagged">Flagged</option>
                  <option value="disqualified">Disqualified</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={reviewData.overallRating}
                  onChange={(e) => setReviewData({...reviewData, overallRating: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows="3"
                  placeholder="Add review notes..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 text-sm"
              >
                Submit Review
              </button>
            </div>
          </div>
        )}

        {/* Existing Review */}
        {session.proctorReview && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Review Complete</h4>
            <div className="text-sm space-y-1">
              <div>Decision: <span className="font-medium">{session.proctorReview.decision}</span></div>
              <div>Rating: {session.proctorReview.overallRating}/10</div>
              <div>Reviewer: {session.proctorReview.reviewerId}</div>
              {session.proctorReview.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  {session.proctorReview.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctoringDashboard;