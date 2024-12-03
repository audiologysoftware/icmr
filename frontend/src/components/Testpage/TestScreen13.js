import React, { useContext, useState, useEffect, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import backendIP from '../../utils/serverData';
import { useNavigate } from 'react-router-dom';
import './TestScreen13.css';
import Popup from '../popup/Popup';
import Goal from '../controllers/Goal';

const TestScreen13 = () => {
  const { g, sk, folderPath, instruction, selectedOptions } = useContext(DataContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFile, setCurrentFile] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const audioRef = useRef(new Audio());

  // Prevent multiple state updates and ensure that the audio plays only once
  const isAudioPlayingRef = useRef(false);

  useEffect(() => {
    if (!folderPath || !selectedOptions) {
      setErrorMessage('Missing required data. Please select options and try again.');
      return;
    }
    fetchAndPlayAudio();
    return () => {
      // Clean up audio when component is unmounted
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isAudioPlayingRef.current = false;
    };
  }, [folderPath, selectedOptions]);

  const constructFilePath = () => {
    const noiseType = selectedOptions['Noise type']?.value || 'defaultNoise';
    const noiseLevel = selectedOptions['Noise level']?.value || 'defaultLevel';
    const topic = selectedOptions['Topic']?.value || 'defaultTopic';
    return `${folderPath}/${noiseType}/${noiseLevel}/${topic}`;
  };

  const fetchAudioFileList = async () => {
    try {
      const constructedPath = constructFilePath();
      const response = await fetch(`${backendIP}/audio/listfiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: constructedPath }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio file list.');
      }

      const fileList = await response.json();
      return fileList;
    } catch (error) {
      console.error('Error fetching file list:', error);
      return [];
    }
  };

  const playAudio = async (fileName) => {
    if (isAudioPlayingRef.current) return;  // Prevent concurrent play requests

    isAudioPlayingRef.current = true;  // Set the flag to indicate audio is playing
    setIsPlaying(true);  // Update state to indicate audio is playing

    const constructedPath = constructFilePath();
    const filenameWithPath = `${constructedPath}/${fileName}`;

    try {
      const response = await fetch(`${backendIP}/audio/getaudio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenameWithPath }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio file.');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Set the audio source to the new URL
      audioRef.current.src = audioUrl;

      // Wait for the audio to load before playing it
      await audioRef.current.load();

      audioRef.current.onended = () => {
        setIsPlaying(false);
        isAudioPlayingRef.current = false;
      };

      // Play the audio
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      isAudioPlayingRef.current = false;
    }
  };

  const fetchAndPlayAudio = async () => {
    const fileList = await fetchAudioFileList();
    if (fileList.length > 0) {
      const randomFile = fileList[Math.floor(Math.random() * fileList.length)];
      setCurrentFile(randomFile);
      await playAudio(randomFile);
    } else {
      console.warn('No audio files available.');
    }
  };

  const handleQuestionClick = () => {
    if (!folderPath || !selectedOptions) {
      setErrorMessage('Missing required parameters. Please go back and select options.');
      return;
    }

    navigate('/testscreen14', {
      state: {
        folderPath,
        selectedOptions,
      },
    });
  };

  const handleRepeat = async () => {
    if (currentFile && !isPlaying) {
      await playAudio(currentFile);
    }
  };

  const handleExit = () => setShowPopup(true);

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/home');
  };

  return (
    <div className="test-screen13">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <Goal g={g} sk={sk} />
      <div className="content">
        <h4>{instruction}</h4>
        <div
          className="audio-icon"
          onClick={() => audioRef.current && audioRef.current.play()}
        >
          <span role="img" aria-label="speaker">
            🔊
          </span>
        </div>
        {currentFile && (
          <div className="current-file">
            <strong>{currentFile}</strong>
          </div>
        )}
      </div>
      <div className="button-row">
        <button
          className="button repeat"
          disabled={!currentFile || isPlaying}
          onClick={handleRepeat}
        >
          Repeat
        </button>
        <button
          className="question-button"
          onClick={handleQuestionClick}
          disabled={isPlaying}
        >
          Question
        </button>
        <button className="exit-button" onClick={handleExit}>
          Exit
        </button>
      </div>
      {showPopup && (
        <Popup score={0} totalAudioPlayed={0} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default TestScreen13;
