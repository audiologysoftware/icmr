


import React, { useContext, useEffect, useState } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import './TestScreen9.css';
import Popup from '../popup/Popup';

const TestScreen9 = () => {
  const {
    updatePlayedScripts,
    currentFileName,
    instruction,
    totalAudioFiles,
    currentFileCount,
    updateCurrentFileCount,
    responsesInCurrentSet,
    memoryScoreCount,
    sequenceScoreCount,
    totalSetsPlayed,
    correctResponses,
    distractionScoreCount,
    updateCorrectResponses,
    updateDistractionScoreCount,
    updateResponsesInCurrentSet,
  } = useContext(DataContext);

  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
 
 
  useEffect(() => {
    if (totalAudioFiles === undefined) {
      navigate('/home');
    }

    if (currentFileCount === undefined || currentFileCount === 0) {
      updateCurrentFileCount(1);
      updateResponsesInCurrentSet([]);
    }
  }, [totalAudioFiles, currentFileCount, navigate, updateCurrentFileCount]);
  const handleResponse = (isCorrect) => {
    console.log("Distraction response:", isCorrect);
  
    // Update played scripts
    updatePlayedScripts((prev) => [
      ...prev,
      { fileName: currentFileName || 'Unknown', isCorrect }
    ]);
  
    const updatedResponses = [...responsesInCurrentSet, isCorrect];
    updateResponsesInCurrentSet(updatedResponses);
    console.log("Updated responsesInCurrentSet:", updatedResponses);
  
    if (isCorrect) {
      updateCorrectResponses((prev) => Number(prev || 0) + 1);
    }
  
    const newFileCount = currentFileCount + 1;
    updateCurrentFileCount(newFileCount);
  
    if (newFileCount > totalAudioFiles) {
      const allCorrectInSet = updatedResponses.every((response) => response === true);
      console.log(`Set completed. Responses: [${updatedResponses.join(', ')}]`);
      console.log(`All responses correct: ${allCorrectInSet}`);
  
      // Update the distraction score count correctly
      if (allCorrectInSet) {
        updateDistractionScoreCount((prevScore) => {
          const newScore = Number(prevScore || 0) + 1; // Calculate new score
          console.log("Updated distraction score:", newScore);
          return newScore; // Return new score
        });
      } else {
        console.log("Not all responses were correct. Distraction score not updated.");
      }
  
      // Clear the responses for the next set
      updateResponsesInCurrentSet([]);
      updateCurrentFileCount(1);
      navigate('/testscreen10');
    } else {
      navigate('/testscreen8');
    }
  };
  

  const handleExit = (e) => {
    e.preventDefault();
    if (isExiting) return;
    setIsExiting(true);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/home');
  };

  // Calculate scores
  const totalCorrectResponses = Number(correctResponses || 0);
  const memoryScore = `${memoryScoreCount}/${totalSetsPlayed}`;
  const sequenceScore = `${sequenceScoreCount}/${totalSetsPlayed}`;
  const distractionRawScore = `${totalCorrectResponses}/${Number(totalAudioFiles || 0) * Number(totalSetsPlayed || 0)}`;
  const distractionScore = totalSetsPlayed ? `${distractionScoreCount}/${totalSetsPlayed}` : 'N/A'; // Ensure no division by zero
  

  console.log("Distraction Score",distractionScore)
  return (
    <div className="test-screen9">
      <h2>{instruction && instruction[1] ? instruction[1] : 'Instructions not available'}</h2>
      <h3>{currentFileName}</h3>
      <div className="button-row">
        <button className="correct" onClick={() => handleResponse(true)}>Correct</button>
        <button className="incorrect" onClick={() => handleResponse(false)}>Incorrect</button>
      </div>
      <div className="button-row">
        <button className="exit" onClick={handleExit}>Exit</button>
      </div>
      {showPopup && (
        <Popup
          memoryScore={memoryScore}
          sequencingScore={sequenceScore}
          distractionRawScore={distractionRawScore}
          distractionScore={distractionScore}
          onClose={handleClosePopup}
          isTestScreen9={true}
        />
      )}
    </div>
  );
};

export default TestScreen9;


