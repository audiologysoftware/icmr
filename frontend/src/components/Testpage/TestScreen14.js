import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TestScreen14.css';
import Popup from '../popup/Popup';
import backendIP from '../../utils/serverData';
import DataContext from '../../stores/DataContextProvider';

const TestScreen14 = () => {
  const { folderPath, selectedOptions } = useContext(DataContext);
  const [questions, setQuestions] = useState([]); // Initialize as an empty array
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentOption, setCurrentOption] = useState([]); // Initialize as an empty array
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0); // Track correct answers
  const location = useLocation();
  const navigate = useNavigate();

  const noiseType = selectedOptions['Noise type']?.value || 'defaultNoise';
  const noiseLevel = selectedOptions['Noise level']?.value || 'defaultLevel';
  const topicName = selectedOptions['Topic']?.value || 'defaultTopic';

  const constructFilePath = () => {
    return `${folderPath}/${noiseType}/`;
  };

  // Fetch questions when component mounts or parameters change
  useEffect(() => {
    if (!folderPath || !noiseType || !noiseLevel || !topicName) {
      setError('Missing required parameters. Please go back and select options.');
      return;
    }
    const fetchQuestions = async () => {
      try {
        const optionPath = constructFilePath();

        const response = await fetch(`${backendIP}/audio/getquestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ optionPath, noiseLevel, topicName }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();

        if (data && typeof data === 'object') {
          const formattedQuestions = Object.entries(data[noiseLevel][topicName]).map(([key, value]) => ({
            question: key, // The key, e.g., "varun kumar"
            options: value.split(','), // Splitting the value by commas into an array
            correctAnswer: value.split(',')[0] // Assuming the first option is always correct
          }));

          if (formattedQuestions.length > 0) {
            setQuestions(formattedQuestions);
            setCurrentQuestion(formattedQuestions[0].question);
            setCurrentOption(formattedQuestions[0].options); // Set the options for the first question
          } else {
            throw new Error('No questions available');
          }
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchQuestions();
  }, [folderPath, noiseType, noiseLevel, topicName]);

  const handleAnswer = (selectedAnswer) => {
    // Check if the selected answer matches the correct answer
    const isAnswerCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;

    // Update the score and correctness state based on the answer
    if (isAnswerCorrect) {
      setIsCorrect(true);
      setCorrectAnswers(prev => prev + 1); // Increment the score for correct answers
    } else {
      setIsCorrect(false); // Incorrect answer, do not increment score
    }

    // Wait a bit before loading the next question
    setTimeout(() => {
      setIsCorrect(null);
      loadNextQuestion(); // Load the next question
    }, 500);
  };

  // Load next question
  const loadNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestion = questions[currentQuestionIndex + 1];
      setCurrentQuestion(nextQuestion.question);
      setCurrentOption(nextQuestion.options);
      setCurrentQuestionIndex((prev) => prev + 1); // Increment the question index
    } else {
      setShowPopup(true);
    }
  };

  // Handle exit button
  const handleExit = () => {
    setShowPopup(true);
  };

  // Close popup and navigate to home
  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/home');
  };

  // If error, display error message
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="test-screen14">
      <h4>Answer all the Questions</h4>
      {questions.length > 0 && !showPopup ? (
        <div className="question-container">
          <h2>Question {currentQuestionIndex + 1}/{questions.length}</h2>
          {/* Display the actual question */}
          <p>{currentQuestion}</p>
          <div className="options-container">
            {/* Display the options (without interaction) */}
            {currentOption.map((option, index) => (
              <div key={index} className="option-display">
                {option}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>{showPopup ? 'Test Complete!' : 'Loading questions...'}</p>
      )}
      <div className="buttons-rows">
        <button
          className={`button correct-btn ${isCorrect === true ? 'highlight correct-btn-highlight' : ''}`}
          onClick={() => handleAnswer(questions[currentQuestionIndex]?.correctAnswer)} // Handle "Correct" response
          disabled={isCorrect !== null}
        >
          Correct
        </button>
        <button
          className={`button incorrect-btn ${isCorrect === false ? 'highlight incorrect-btn-highlight' : ''}`}
          onClick={() => handleAnswer('incorrect')} // Handle "Incorrect" response
          disabled={isCorrect !== null}
        >
          Incorrect
        </button>
        <button className="button exit-btn" onClick={handleExit}>
          Exit
        </button>
      </div>

      {showPopup && (
        <Popup
          score={correctAnswers}  // Pass the correctAnswers as the score
          totalAudioPlayed={questions.length}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default TestScreen14;
