import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../../services/api';
import { Card, LoadingSpinner, Button, Modal } from '../common/UIComponents';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';
import { useTimer, useModal } from '../../hooks/useCustomHooks';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  
  const submitModal = useModal();
  const timeUpModal = useModal();

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getById(id);
      const data = response.data.data;
      setAssessment(data);
      
      // Start assessment
      await assessmentAPI.start(id);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      alert('Failed to load assessment');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const timer = useTimer(
    assessment?.duration ? assessment.duration * 60 : 3600,
    () => {
      timeUpModal.open();
      handleSubmit(true);
    }
  );

  useEffect(() => {
    if (assessment) {
      timer.start();
    }
  }, [assessment]);

  const currentQuestion = assessment?.questions?.[currentQuestionIndex];

  const handleAnswerChange = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion._id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion._id)) {
      newFlagged.delete(currentQuestion._id);
    } else {
      newFlagged.add(currentQuestion._id);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      submitModal.close();
    }
    
    try {
      setSubmitting(true);
      timer.pause();
      
      // Format answers for submission
      const formattedAnswers = assessment.questions.map(q => ({
        question: q._id,
        answer: answers[q._id] || null,
      }));

      const response = await assessmentAPI.submit(id, { answers: formattedAnswers });
      const result = response.data.data;
      
      navigate(`/results/${result._id}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment');
      setSubmitting(false);
      timer.start();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / assessment.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-mono text-lg font-semibold text-gray-900">
                  {timer.formatTime()}
                </span>
              </div>
              <Button onClick={submitModal.open} variant="success">
                Submit Test
              </Button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {answeredCount} of {assessment.questions.length} questions answered
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {currentQuestion.type}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <h2 className="text-xl text-gray-900 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`ml-4 p-2 rounded-lg ${
                    flagged.has(currentQuestion._id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.type === 'multiple-choice' &&
                  currentQuestion.options?.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers[currentQuestion._id] === option
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option}
                        checked={answers[currentQuestion._id] === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}

                {currentQuestion.type === 'true-false' && (
                  <>
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          answers[currentQuestion._id] === option
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={option}
                          checked={answers[currentQuestion._id] === option}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-5 h-5 text-indigo-600"
                        />
                        <span className="ml-3 text-gray-900">{option}</span>
                      </label>
                    ))}
                  </>
                )}

                {currentQuestion.type === 'short-answer' && (
                  <textarea
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    rows="4"
                    placeholder="Type your answer here..."
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === assessment.questions.length - 1}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {assessment.questions.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-indigo-600 text-white'
                        : answers[question._id]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : flagged.has(question._id)
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal isOpen={submitModal.isOpen} onClose={submitModal.close} title="Submit Assessment">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                You have answered {answeredCount} out of {assessment.questions.length} questions.
                {answeredCount < assessment.questions.length && (
                  <span className="block mt-1 font-medium">
                    {assessment.questions.length - answeredCount} questions are unanswered.
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            Are you sure you want to submit this assessment? You won't be able to change your answers after submission.
          </p>
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => handleSubmit(false)} variant="success" className="flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Yes, Submit'}
            </Button>
            <Button onClick={submitModal.close} variant="secondary" disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Time Up Modal */}
      <Modal isOpen={timeUpModal.isOpen} onClose={() => {}} title="Time's Up!">
        <div className="space-y-4">
          <p className="text-gray-700">
            The time limit has been reached. Your assessment is being submitted automatically.
          </p>
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TakeAssessment;
