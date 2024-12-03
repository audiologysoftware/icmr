

import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup';
import './TestScreen6.css';
import Goal from '../controllers/Goal';

const TestScreen6 = () => {
  const { sk, g, selectedOptions, isi, folderPath, updatePlayedScripts,memoryScoreCount,sequenceScoreCount, totalSetsPlayed} = useContext(DataContext);
  const [selectedFileNames, setSelectedFileNames] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isExiting, setIsExiting] = useState(false); // For handling exit logic
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedScripts, setPlayedScripts] = useState([]);
  const navigate = useNavigate();
  const abortControllerRef = useRef();
  const timeoutRef = useRef(null); // Moved ref declaration here

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchSelectedAudio();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedOptions]);

  const fetchSelectedAudio = async () => {
    try {
      const recallLevel = selectedOptions['Recall Level']?.value || selectedOptions['Recall Level']?.label || '';
      const numberOfSelections = getNumberOfSelections(recallLevel);

      if (!recallLevel) {
        console.error('Recall level is not selected');
        return;
      }

      console.log(`Fetching audio files from: ${folderPath}/${recallLevel}`);

      const response = await fetch(`${backendIP}/audio/listfiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: `${folderPath}/${recallLevel}` }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio files: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched audio files:', data);

      if (!Array.isArray(data)) {
        console.error('Expected an array of file names');
        return;
      }

      setSelectedFileNames(data);
      const randomFiles = selectRandomFiles(data, numberOfSelections);
      await playAudioFiles(randomFiles);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Failed to fetch audio files:', error);
      }
    }
  };

  const getNumberOfSelections = (recallLevel) => {
    const levelMap = {
      'onesti': 1,
      'twosti': 2,
      'threesti': 3,
      'foursti': 4,
      'fivesti': 5,
      'sixsti': 6,
      'sevensti': 7,
      'eightsti': 8,
      'ninesti': 9,
      'tensti': 10,
      'elevensti': 11,
      'twelevesti': 12,
      'thirteensti': 13,
      'fourteensti': 14,
      'fifteensti': 15,
      'sixteensti': 16
    };
    return levelMap[recallLevel] || 0;
  };

  const selectRandomFiles = (fileNames, count) => {
    const shuffled = fileNames.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const playAudioFiles = async (fileNames) => {
    if (isPlaying) return;

    setIsPlaying(true);
    const scripts = [];

    for (const fileName of fileNames) {
      await playAudio(fileName);
      scripts.push(fileName.replace('.wav', ''));
      await new Promise((resolve) => setTimeout(resolve, isi ));
    }

    setPlayedScripts(scripts);
    updatePlayedScripts(scripts); // Update context with played scripts
    console.log("Before Navigating to TestScreen7, Played Scripts:", scripts);

    setIsPlaying(false);
    navigate('/testscreen7');
  };

  const playAudio = async (fileName) => {
    try {
      const filePath = constructFilePath(fileName);
      if (!filePath) return;

      const response = await fetch(`${backendIP}/audio/getaudio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenameWithPath: filePath }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current.src = audioUrl;

      await new Promise((resolve, reject) => {
        audioRef.current.oncanplaythrough = resolve;
        audioRef.current.onerror = reject;
      });

      setCurrentFileName(fileName.replace('.wav', ''));
      await audioRef.current.play();

      await new Promise((resolve) => {
        audioRef.current.onended = resolve;
      });

      setCurrentFileName('');
    } catch (error) {
      console.error('Failed to load audio file:', error);
    }
  };

  const constructFilePath = (fileName) => {
    const recallLevel = selectedOptions['Recall Level']?.value || selectedOptions['Recall Level']?.label || '';
    if (!recallLevel) {
      console.error('Recall level not selected');
      return '';
    }
    const path = `${folderPath}/${recallLevel}/${fileName}`;
    console.log(`Constructed file path: ${path}`);
    return path;
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

  const memoryScore = `${memoryScoreCount}/${totalSetsPlayed}`;
  const sequenceScore = `${sequenceScoreCount}/${totalSetsPlayed}`;

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsExiting(false); // Reset exiting state when popup is closed
    navigate('/home'); // Navigate to home after manually closing the popup
  };
  return (
    <div className="test-screen6">
     <Goal g={g} sk={sk} />
      <div className="content">
       
        <div className="audio-icon" onClick={fetchSelectedAudio}>
          <span role="img" aria-label="speaker">🔊</span>
        </div>
        <h2 className="display-script">
          {currentFileName ? ` ${currentFileName}` : ''}
        </h2>
      </div>
      <button className="button exit" onClick={handleExit}>
          Exit
        </button>
        {showPopup && (
  <Popup
    memoryScore={memoryScore}
    sequencingScore={sequenceScore}
    onClose={handleClosePopup}
    isTestScreen6={true}
  
  />
)}
    </div>
  );
};

export default TestScreen6;
