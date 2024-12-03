import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import Popup from '../popup/Popup';
import './TestScreen7.css'; // Ensure the correct CSS file name

const TestScreen10 = () => {
  const {
    playedScripts,
    updatePlayedScripts,
    memoryScoreCount,
    updateMemoryScoreCount,
    sequenceScoreCount,
    updateSequenceScoreCount,
    correctResponses,
    totalSetsPlayed,
    distractionScoreCount,
    totalAudioFiles,
    updateTotalSetsPlayed,
  } = useContext(DataContext);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [buttonColors, setButtonColors] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [responseOrder, setResponseOrder] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [localCorrectResponses, setLocalCorrectResponses] = useState(0);

  const navigate = useNavigate();
  const audioRef = useRef(new Audio());
  const timeoutRef = useRef(null); // Ref to store timeout ID

  useEffect(() => {
    if (!isExiting) {


      // Check if playedScripts is an array and filter valid strings
      const validScripts = playedScripts.filter(script => typeof script === 'string' && script !== '');

      if (validScripts.length > 0) {
        setSelectedScripts(validScripts);
        setUserResponses(Array(validScripts.length).fill(''));
        setButtonColors(Array(validScripts.length).fill('default'));
        setResponseOrder([]); // Reset response order

        // Play the selected scripts in sequence
        playScripts(validScripts);
      }
    }
  }, [playedScripts, isExiting]);

  const playScripts = (scripts) => {
    let currentIndex = 0;

    const playNextScript = () => {
      if (currentIndex < scripts.length) {
        // Stop current audio if it's playing
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // Reset time to start
        }

        audioRef.current.src = scripts[currentIndex]; // Set the audio source

        audioRef.current.play().then(() => {
          audioRef.current.onended = () => {
            currentIndex += 1;
            playNextScript(); // Play the next script when the current one ends
          };
        }).catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    };

    playNextScript(); // Start playing the first script
  };

  const handleResponseClick = (index) => {
    if (isExiting) return;

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

    const sequenceScore = checkSequence(newResponseOrder);

    console.log('Sequence Score:', sequenceScore);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (isExiting) return;

    setIsEditing(true);
    setButtonColors(Array(selectedScripts.length).fill('default'));
    setUserResponses(Array(selectedScripts.length).fill(''));
    setResponseOrder([]);
  };

  const checkSequence = (currentResponseOrder) => {
    if (currentResponseOrder.length !== selectedScripts.length) {
      return 0;
    }
    return currentResponseOrder.every((response, index) => response === selectedScripts[index]) ? 1 : 0;
  };

  const calculateScores = () => {
    let memoryCount = 0;
    let sequenceCount = 0;

    const allResponsesProvided = userResponses.filter(Boolean).length === selectedScripts.length;

    if (allResponsesProvided) {
      const allCorrect = selectedScripts.every(script => userResponses.includes(script));
      if (allCorrect) {
        memoryCount = 1;
      }
      sequenceCount = checkSequence(responseOrder);
    } else {
      memoryCount = 0;
      sequenceCount = 0;
    }

    console.log(`Final Scores - Memory Count: ${memoryCount}, Sequence Count: ${sequenceCount}`);
    return { memoryCount, sequenceCount };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isExiting) return;

    const { memoryCount, sequenceCount } = calculateScores();
    updateMemoryScoreCount(prev => prev + memoryCount);
    updateSequenceScoreCount(prev => prev + sequenceCount);
    updateTotalSetsPlayed(totalSetsPlayed + 1);

    setUserResponses([]);
    setResponseOrder([]);
    updatePlayedScripts([]);
    setButtonColors(Array(selectedScripts.length).fill('default'));

    timeoutRef.current = setTimeout(() => {
      if (!isExiting) {
        setButtonColors(Array(selectedScripts.length).fill('default'));
        setSelectedScripts([]);
        navigate('/testScreen8'); // Replace this with the desired screen.
      }
    }, 1500);
  };

  const handleExit = (e) => {
    e.preventDefault();
    if (isExiting) return;
    console.log('Exit button clicked.');

    // Calculate the scores before exiting
    const { memoryCount, sequenceCount } = calculateScores();

    // Update the state with the calculated scores
    updateMemoryScoreCount(prev => prev + memoryCount);
    updateSequenceScoreCount(prev => prev + sequenceCount);

    console.log('Updated Memory Score Count:', memoryScoreCount + memoryCount);
    console.log('Updated Sequence Score Count:', sequenceScoreCount + sequenceCount);

    // Increase the total sets played
    // updateTotalSetsPlayed(totalSetsPlayed + 1);

    // Set the state for exiting and showing the popup
    setIsExiting(true);
    setShowPopup(true);

    // Clear any existing timeout to avoid navigating away
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  const totalCorrectResponses = Number(correctResponses || 0) + localCorrectResponses;
  // Ensure that the score variables reflect the updated values
  const memoryScore = `${memoryScoreCount}/${totalSetsPlayed}`;
  const sequenceScore = `${sequenceScoreCount}/${totalSetsPlayed}`;
  const distractionScore = `${distractionScoreCount}/${totalSetsPlayed}`;
  const distractionRawScore = `${totalCorrectResponses}/${Number(totalAudioFiles || 0) * Number(totalSetsPlayed || 0)}`;


  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/home');
  };
  
  return (
    <div className="test-screen7">

      <div className="content">
        <h3>Recall in the same order</h3>
        <div className="scripts-display">
          <ul>
            {selectedScripts.length > 0 ? (
              selectedScripts.map((script, index) => {
                if (typeof script !== 'string') {
                  console.error(`Invalid script type at index ${index}:`, script);
                  return null; // Skip invalid scripts
                }

                const displayScript = script.replace(/\.wav$/, '');
                return (
                  <li key={index}>
                    <button
                      className={`response-btn ${buttonColors[index]}`}
                      onClick={() => handleResponseClick(index)}
                    >
                      {userResponses[index]?.replace(/\.wav$/, '') || displayScript}
                    </button>
                  </li>
                );
              })
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
          distractionRawScore={distractionRawScore}
          distractionScore={distractionScore}
          onClose={handleClosePopup}
          isTestScreen10={true} // or false, depending on the screen
        />
      )}
    </div>
  );
};

export default TestScreen10;
