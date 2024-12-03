import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import Popup from '../popup/Popup';
import './TestScreen7.css';
import Goal from '../controllers/Goal';

const TestScreen7 = () => {
  const {
    sk,
    g,
    playedScripts,
    updatePlayedScripts,
    memoryScoreCount,
    updateMemoryScoreCount,
    sequenceScoreCount,
    updateSequenceScoreCount,
    totalSetsPlayed,
    updateTotalSetsPlayed,
  } = useContext(DataContext);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [buttonColors, setButtonColors] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [responseOrder, setResponseOrder] = useState([]);
  const [isExiting, setIsExiting] = useState(false); // For handling exit logic
  const navigate = useNavigate();
  const timeoutRef = useRef(null); // Moved ref declaration here

  useEffect(() => {
    setSelectedScripts(playedScripts);
    setUserResponses(Array(playedScripts.length).fill(''));
    setButtonColors(Array(playedScripts.length).fill('default'));
  }, [playedScripts]);

  const handleResponseClick = (index) => {
    if (isExiting) return; // Stop handling clicks if exiting

    const newColors = [...buttonColors];
    const newResponses = [...userResponses];
    let newResponseOrder = [...responseOrder];

    if (isEditing) {
      newColors[index] = 'green';
      newResponses[index] = selectedScripts[index];
    } else {
      if (newColors[index] === 'default') {
        newColors[index] = 'green';
        newResponses[index] = selectedScripts[index];
        newResponseOrder.push(selectedScripts[index]);
      } else {
        newColors[index] = 'default';
        newResponses[index] = '';
        newResponseOrder = newResponseOrder.filter(item => item !== selectedScripts[index]);
      }
    }

    setButtonColors(newColors);
    setUserResponses(newResponses);
    setResponseOrder(newResponseOrder);

    // Check sequence after each click
    const sequenceScore = checkSequence(newResponseOrder);
    console.log('Current Response Order:', newResponseOrder);
    console.log('Sequence Score:', sequenceScore);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (isExiting) return; // Prevent editing if exiting

    setIsEditing(true);
    setButtonColors(Array(selectedScripts.length).fill('default'));
    setUserResponses(Array(selectedScripts.length).fill(''));
  };

  const checkSequence = (currentResponseOrder) => {
    return currentResponseOrder.every(
      (response, index) => response === selectedScripts[index]
    ) ? 1 : 0;
  };

  const calculateScores = () => {
    let memoryCount = 0;
    let sequenceCount = 0;

    // Check if all responses are correct, regardless of order
    const allCorrect = selectedScripts.every((script) =>
      userResponses.includes(script)
    );

    if (allCorrect) {
      memoryCount = 1;
    }

    // Check if the responses are in the correct sequence
    sequenceCount = checkSequence(responseOrder);

    console.log(
      `Final Scores - Memory Count: ${memoryCount}, Sequence Count: ${sequenceCount}`
    );

    return { memoryCount, sequenceCount };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isExiting) return; // Prevent submission if exiting

    const { memoryCount, sequenceCount } = calculateScores();

    updateMemoryScoreCount((prev) => prev + memoryCount);
    updateSequenceScoreCount((prev) => prev + sequenceCount);

    console.log('Updated Memory Score Count:', memoryScoreCount + memoryCount);
    console.log(
      'Updated Sequence Score Count:',
      sequenceScoreCount + sequenceCount
    );

    updateTotalSetsPlayed(totalSetsPlayed + 1);
    console.log('Total Sets Played:', totalSetsPlayed + 1);

    updatePlayedScripts(userResponses);

    // Clear the state and navigate after a short delay
    timeoutRef.current = setTimeout(() => {
      if (!isExiting) {
        setButtonColors(Array(selectedScripts.length).fill('default'));
        setSelectedScripts([]);
        navigate('/testScreen6');
      }
    }, 3000);
  };

  const handleExit = (e) => {
    e.preventDefault();
    if (isExiting) return; // Prevent multiple exit actions
    console.log('Exit button clicked.');
    setIsExiting(true); // Set the exiting state to true
    setShowPopup(true); // Show popup when exit is clicked

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsExiting(false); // Reset exiting state when popup is closed
    navigate('/home'); // Navigate to home after manually closing the popup
  };

  const memoryScore = `${memoryScoreCount}/${totalSetsPlayed}`;
  const sequenceScore = `${sequenceScoreCount}/${totalSetsPlayed}`;

  return (
    <div className={`test-screen7 ${isExiting ? 'exiting' : ''}`}>
    <Goal g={g} sk={sk} />
      <div className="content">
       
        <h4>Click the childs response in the same order</h4>
        <div className="scripts-display">
          <ul>
            {selectedScripts.length > 0 ? (
              selectedScripts.map((script, index) => (
                <li key={index}>
                  <button
                    className={`response-btn ${buttonColors[index]}`}
                    onClick={() => handleResponseClick(index)}
                    disabled={isExiting} // Disable button if exiting
                  >
                    {userResponses[index] || script}
                  </button>
                </li>
              ))
            ) : (
              <li>No played scripts available.</li>
            )}
          </ul>
        </div>
      </div>
      <div className="control-buttons">
        <button className="control-btn edit-btn" onClick={handleEdit}>
          Edit
        </button>
        <button className="control-btn submit-btn" onClick={handleSubmit}>
          Submit
        </button>
        <button className="control-btn exit-btn" onClick={handleExit}>
          Exit
        </button>
      </div>

      {showPopup && (
        <Popup
          memoryScore={memoryScore}
          sequencingScore={sequenceScore}
          onClose={handleClosePopup} // Ensure navigation happens only when popup is closed
          isTestScreen7={true}
        />
      )}
    </div>
  );
};

export default TestScreen7;
