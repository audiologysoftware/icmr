import React, { useContext, useState, useEffect, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom'; 
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup'; // Import the Popup component
import Goal from '../controllers/Goal';
import Button from '../controllers/Button';
import './TestScreen3.css';

const TestScreen3 = () => {
  const { sk, g, instruction, folderPath } = useContext(DataContext);
  const [displayScript, setDisplayScript] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [score, setScore] = useState(0);
  const [totalAudioPlayed, setTotalAudioPlayed] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [playedFiles, setPlayedFiles] = useState([]); // New state to track played files
  const audioRef = useRef(null);
  const abortControllerRef = useRef(new AbortController());
  const navigate = useNavigate();

  useEffect(() => {
    if (folderPath) {
      fetchSelectedAudio();
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
  }, [folderPath]);

  const fetchSelectedAudio = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${backendIP}/audio/listfiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error(`Failed to fetch audio file list: ${errorDetails}`);
        throw new Error(`Failed to fetch audio file list: ${errorDetails}`);
      }

      const audioData = await response.json();
    
      if (Array.isArray(audioData) && audioData.length > 0) {
        let availableFiles = audioData.filter(file => !playedFiles.includes(file));
        
        if (availableFiles.length === 0) {
          // If all files have been played, reset the playedFiles list
          availableFiles = audioData;
          setPlayedFiles([]);
        }

        const randomIndex = Math.floor(Math.random() * availableFiles.length);
        const selectedFileName = availableFiles[randomIndex];
        if (typeof selectedFileName !== 'string') {
          console.error('Expected selectedFileName to be a string, but got:', typeof selectedFileName);
          return;
        }
        const fileNameWithoutExtension = selectedFileName.replace('.wav', '');
        setSelectedFileName(selectedFileName);
        setDisplayScript(fileNameWithoutExtension); // Display file name without extension
        setPlayedFiles(prevFiles => [...prevFiles, selectedFileName]); // Update playedFiles list
        playAudio(selectedFileName);
      } else {
        console.warn('No audio files found in the folder');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching audio file:', error);
      }
    }
  };

  const playAudio = async (fileName) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      if (!fileName || typeof fileName !== 'string') {
        console.error('No file name provided for audio playback');
        return;
      }

      const filenameWithPath = `${folderPath}/${fileName}`;

      const response = await fetch(`${backendIP}/audio/getaudio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenameWithPath }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error(`Failed to fetch audio file: ${errorDetails}`);
        throw new Error(`Failed to fetch audio file: ${errorDetails}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioUrl;
      audioRef.current.play();

      audioRef.current.onended = () => {
        // Optionally handle actions when audio ends
      };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load audio file:', error);
      }
    }
  };

  const handleCorrect = () => {
    setScore(prevScore => prevScore + 1);
    setTotalAudioPlayed(prevTotal => prevTotal + 1);
    setTimeout(() => {
      fetchSelectedAudio();
    }, 3000); // 3-second delay before fetching the next audio file
  };

  const handleIncorrect = () => {
    setTotalAudioPlayed(prevTotal => prevTotal + 1);
    setTimeout(() => {
      fetchSelectedAudio();
    }, 3000); // 3-second delay before fetching the next audio file
  };

  const handleRepeat = () => {
    if (selectedFileName) {
      playAudio(selectedFileName);
    }
  };

  const handleExit = () => {
    setShowPopup(true); // Show popup when exit button is clicked
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
    navigate('/home');
  };
  return (
    <div className="test-screen3"> {/* Changed class name to test-screen3 */}
      <Goal g={g} sk={sk} />
      <div className="content">
     
        <h4>{instruction}</h4>
        <div className="audio-icon" onClick={() => audioRef.current && audioRef.current.play()}>
          <span role="img" aria-label="speaker">🔊</span>
        </div>
        <h2 className="display-script">{displayScript}</h2>
      </div>
      <div className="button-row">
        <div className="button-row correct-incorrect">
          <button className="button correct" onClick={handleCorrect}>Correct</button>
          <button className="button incorrect" onClick={handleIncorrect}>Incorrect</button>
        </div>
        <div className="button-row repeat-exit"> {/* Updated button row class */}
   
        {/* <Button buttonName="Back" handleClick={handleRepeat} backgroundColor={"#2F4046"} /> */}
          <button className="button repeat" onClick={handleRepeat}>Repeat</button>
          <button className="button exit" onClick={handleExit}>Exit</button>
        </div>
      </div>
      {showPopup && (
        <Popup score={score} totalAudioPlayed={totalAudioPlayed} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default TestScreen3;
