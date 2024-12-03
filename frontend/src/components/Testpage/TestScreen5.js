import React, { useContext, useState, useEffect, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup';
import './TestScreen5.css';
import Goal from '../controllers/Goal';

const TestScreen5 = () => {
  const { sk, g, instruction, folderPath, selectedOptions, taskType } = useContext(DataContext);
  const [displayScript, setDisplayScript] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [score, setScore] = useState(0);
  const [totalAudioPlayed, setTotalAudioPlayed] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [options, setOptions] = useState([]); // Store options for the current audio
  const [showOptionsList, setShowOptionsList] = useState(false); // Track if options should be displayed
  const [showScript, setShowScript] = useState(true); // Track visibility of script
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const taskTypeValue = selectedOptions?.["Task Type"]?.value || taskType?.value;
    if (folderPath && taskTypeValue) {
      fetchSelectedAudio(taskTypeValue);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [folderPath, selectedOptions, taskType]);
  const fetchSelectedAudio = async (taskTypeValue) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
  
      const pathToCheck = `${folderPath}/${taskTypeValue}`;
      const response = await fetch(`${backendIP}/audio/listfiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: pathToCheck }),
        signal: abortControllerRef.current.signal,
      });
  
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
  
      const audioFiles = await response.json();
      if (audioFiles.length === 0) return;
  
      const randomIndex = Math.floor(Math.random() * audioFiles.length);
      const selectedFile = audioFiles[randomIndex];
  
      setSelectedFileName(selectedFile);
      setDisplayScript(selectedFile.replace('.wav', ''));
      playAudio(selectedFile, pathToCheck);
  
      // Fetch options if the file is available and has associated options
      fetchOptionsForAudio(selectedFile);
    } catch (error) {
      if (error.name !== 'AbortError') console.error(error);
    }
  };


  const fetchOptionsForAudio = async (fileName) => {
    try {
      const response = await fetch(`${backendIP}/audio/getoptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
  
      if (!response.ok) throw new Error(`Failed to fetch options: ${response.statusText}`);
  
      const data = await response.json();
      setOptions(data.options || []); // Store options or an empty array if none exist
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };
  const playAudio = async (fileName, folderPath) => {
    try {
      if (!fileName) return;

      const filenameWithPath = `${folderPath}/${fileName}`;
      const response = await fetch(`${backendIP}/audio/getaudio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenameWithPath }),
      });

      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCorrect = () => {
    setScore((prev) => prev + 1);
    setTotalAudioPlayed((prev) => prev + 1);
    triggerNextAudio();
  };

  const handleIncorrect = () => {
    setTotalAudioPlayed((prev) => prev + 1);
    triggerNextAudio();
  };

  const triggerNextAudio = () => {
    setShowOptionsList(false); // Hide options when moving to the next audio
    setTimeout(() => {
      const taskTypeValue = selectedOptions?.["Task Type"]?.value || taskType?.value;
      if (folderPath && taskTypeValue) fetchSelectedAudio(taskTypeValue);
    }, 3000);
  };

  const handleRepeat = () => {
    const taskTypeValue = selectedOptions?.["Task Type"]?.value || taskType?.value;
    if (selectedFileName && taskTypeValue) {
      playAudio(selectedFileName, `${folderPath}/${taskTypeValue}`);
    }
  };

  const handleExit = () => setShowPopup(true);

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/home');
  };

  const toggleOptions = () => {
    setShowOptionsList((prev) => !prev); // Toggle the visibility of options
    setShowScript((prev) => !prev); // Toggle visibility of the script
  };
  return (
    <div className="test-container">
    <Goal g={g} />
    
    <div className="content">
      <div className="instruction-section">
        <h2 className="skill-title">{sk}</h2>
        {/* <h4 className="instruction-text">{instruction}</h4> */}
      </div>

      <div className="audio-section">
        <div 
          className="audio-button-icon"
          onClick={() => audioRef.current?.play()}
          role="button"
          tabIndex={0}
          aria-label="Play audio"
        >
        <span role="img" aria-label="speaker">🔊</span>
        </div>
        {showScript && (
          // <div className="script-display">
            <h4>{displayScript}</h4>
          // </div>
        )}
      </div>

      <div className="options-section">
        {/* Show the options button only if options exist */}
        {options.length > 0 && (
          <button 
            className={`control-button ${showOptionsList ? 'active' : ''}`}
            onClick={toggleOptions}
          >
            {showOptionsList ? 'Hide Options' : 'Show Options'}
          </button>
        )}
      </div>

      {/* Display Options List if showOptionsList is true and options exist */}
      {showOptionsList && options.length > 0 && (
        <div className="options-list">
          {options.map((option, index) => (
            <div key={index} className="option-item">
              {option}
            </div>
          ))}
        </div>
      )}

      

      <audio ref={audioRef} />

      {showPopup && (
        <Popup 
          score={score} 
          totalAudioPlayed={totalAudioPlayed} 
          onClose={handleClosePopup} 
        />
      )}
    </div>
    <div className="control-section">
        <div className="button-row">
          <button 
            className="control-button correct"
            onClick={handleCorrect}
          >
            Correct
          </button>
          <button 
            className="control-button incorrect"
            onClick={handleIncorrect}
          >
            Incorrect
          </button>
        </div>

        <div className="button-row">
          <button 
            className="control-button repeat"
            onClick={handleRepeat}
          >
            Repeat
          </button>
          <button 
            className="control-button exit"
            onClick={handleExit}
          >
            Exit
          </button>
        </div>
      </div>
  </div>
);
  
};

export default TestScreen5;
