import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup';
import './TestScreen6.css';
import Goal from '../controllers/Goal';

const TestScreen8 = () => {
  const {
    sk, g, selectedOptions, isi, folderPath,
    updatePlayedScripts, totalSetsPlayed, memoryScoreCount, correctResponses,distractionScoreCount,totalAudioFiles, sequenceScoreCount, updateTotalAudioFiles
  } = useContext(DataContext);

  const [selectedFileNames, setSelectedFileNames] = useState([]);
  const [isExiting, setIsExiting] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef(null); // Ref to store timeout ID
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localCorrectResponses, setLocalCorrectResponses] = useState(0);

  const navigate = useNavigate();
  const audioRef = useRef(new Audio());
  const abortControllerRef = useRef();

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchSelectedAudio();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      audioRef.current.pause();
      audioRef.current.src = ''; // Reset audio on cleanup
    };
  }, [selectedOptions]);


  const fetchSelectedAudio = async () => {
    try {
      const recallLevel = selectedOptions['Recall Level']?.value || selectedOptions['Recall Level']?.label || '';
      const numberOfSelections = getNumberOfSelections(recallLevel);
      updateTotalAudioFiles(numberOfSelections);

      if (!recallLevel) {
        console.error('Recall level is not selected');
        return;
      }

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
      const randomFiles = selectRandomFiles(data, numberOfSelections);
      if (randomFiles.length === 0) {
        console.error('No audio files selected. Please check your backend response.');
        return;
      }

      setSelectedFileNames(randomFiles);
      playNextAudio(randomFiles, 0);
    } catch (error) {
      if (error.name === 'AbortError') {

      } else {
        console.error('Failed to fetch audio files:', error);
      }
    }
  };

  const getNumberOfSelections = (recallLevel) => {
    const levelMap = {
      'onesti': 1, 'twosti': 2, 'threesti': 3, 'foursti': 4, 'fivesti': 5,
      'sixsti': 6, 'sevensti': 7, 'eightsti': 8, 'ninesti': 9, 'tensti': 10,
      'elevensti': 11, 'twelevesti': 12, 'thirteensti': 13, 'fourteensti': 14,
      'fifteensti': 15, 'sixteensti': 16,
    };
    return levelMap[recallLevel] || 0;
  };

  const selectRandomFiles = (fileNames, count) => {
    const shuffled = fileNames.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const playNextAudio = async (fileNames, index) => {
    if (isPlaying || index >= fileNames.length || index < 0) return;

    const fileName = fileNames[index];

    if (!fileName) {
      console.error(`Invalid fileName at index ${index}:`, fileNames);
      return;
    }

    setIsPlaying(true);
    setCurrentAudioIndex(index);

    await playAudio(fileName);

    if (fileName) {
      updatePlayedScripts((prevScripts) => {
        const newScripts = [...prevScripts, fileName].filter(Boolean);
        return newScripts;
      });
    }

    console.log('Playing File Name:', fileName);
    setTimeout(() => {
      navigate('/testscreen9', { state: { fileName: fileName.replace('.wav', '') } });
    }, isi);

    setIsPlaying(false);
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
    return `${folderPath}/${recallLevel}/${fileName}`;
  };
  const totalCorrectResponses = Number(correctResponses || 0) + localCorrectResponses;
  const memoryScore = `${memoryScoreCount}/${totalSetsPlayed}`;
  const sequenceScore = `${sequenceScoreCount}/${totalSetsPlayed}`;
  const distractionRawScore = `${totalCorrectResponses}/${Number(totalAudioFiles || 0) * Number(totalSetsPlayed || 0)}`;
  const distractionScore = `${distractionScoreCount}/${totalSetsPlayed}`;

  const handleExit = (e) => {
    e.preventDefault();
    if (isExiting) return;
    console.log('Exit button clicked.');
    setIsExiting(true);
    setShowPopup(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/home');
  };


  return (
    <div className="test-screen6">
     <Goal g={g} sk={sk} />
      <div className="content">
     
        <div className="audio-icon" onClick={() => playNextAudio(selectedFileNames, currentAudioIndex)}>
          <span role="img" aria-label="speaker">🔊</span>
        </div>
        <h2 className="display-script">{currentFileName ? currentFileName : ''}</h2>
      </div>
      <div className="button-row">
        <button className="button exit" onClick={handleExit}>Exit</button>
      </div>
      {showPopup && (
        <Popup
          memoryScore={memoryScore}
          sequencingScore={sequenceScore}
          distractionRawScore={distractionRawScore}
          distractionScore={distractionScore}
          onClose={handleClosePopup}
          isTestScreen8={true}   // or false, depending on the screen
        />
      )}
    </div>

  );
};

export default TestScreen8;
