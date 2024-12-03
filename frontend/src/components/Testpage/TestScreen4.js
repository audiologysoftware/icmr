import React, { useContext, useState, useEffect, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup';
import { useNavigate } from 'react-router-dom'; 
import './TestScreen4.css';
import Goal from '../controllers/Goal';

const TestScreen4 = () => {
  const { sk, g, folderPath, selectedOptions } = useContext(DataContext);
  const [displayWord, setDisplayWord] = useState('');
  const [options, setOptions] = useState([]);
  const [correctWord, setCorrectWord] = useState('');
  const [score, setScore] = useState(0);
  const [totalAudioPlayed, setTotalAudioPlayed] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedFiles, setPlayedFiles] = useState(new Set());
  const [showOptions, setShowOptions] = useState(false);
  const [showDisplay, setShowDisplay] = useState(true);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const navigate = useNavigate();

  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchSelectedAudio();
  }, [folderPath, selectedOptions]);

  const constructFilePath = (fileName) => {
    const noiseType = selectedOptions['Noise type']?.value;
    const noiseLevel = selectedOptions['Noise level']?.value;
    const filterType = selectedOptions['Filter Type']?.value; 
    const cutOffFrequency = selectedOptions['Cut off frequency']?.value;
    const compressionPercentage = selectedOptions['Compression Percentage']?.value;
  
   
  
    try {
      let path = folderPath;

      if (compressionPercentage) {
        path += `/${compressionPercentage}`;
      } else if (filterType && cutOffFrequency) {
        path += `/${filterType}/${cutOffFrequency}`;
      } else if (noiseType && noiseLevel) {
        path += `/${noiseType}/${noiseLevel}`;
      }
  
      return `${path}/${fileName}`;
    } catch (error) {
      console.error("Error constructing file path:", error);
      return null;
    }
  };

  const fetchAvailableFiles = async () => {
    const noiseType = selectedOptions['Noise type']?.value;
    const noiseLevel = selectedOptions['Noise level']?.value;
    const filterType = selectedOptions['Filter Type']?.value; 
    const cutOffFrequency = selectedOptions['Cut off frequency']?.value;
    const compressionPercentage = selectedOptions['Compression Percentage']?.value;
  
    console.log("Fetching available files with:", { noiseType, noiseLevel, filterType, cutOffFrequency, compressionPercentage });
  
    let pathToCheck = '';
  
    if (compressionPercentage) {
      pathToCheck = `${folderPath}/${compressionPercentage}`;
    } else if (filterType && cutOffFrequency) {
      pathToCheck = `${folderPath}/${filterType}/${cutOffFrequency}`;
    } else if (noiseType && noiseLevel) {
      pathToCheck = `${folderPath}/${noiseType}/${noiseLevel}`;
    } else {
      console.error('Missing required selections');
      return []; 
    }

    const response = await fetch(`${backendIP}/audio/listfiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath: pathToCheck }),
    });

    if (!response.ok) {
      console.error('Failed to fetch available audio files');
      return [];
    }

    const availableFiles = await response.json();
    return availableFiles;
  };

  const playAudio = async (fileName) => {
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    try {
      setIsPlaying(true);
      setButtonsDisabled(true);

      const filenameWithPath = constructFilePath(fileName);
      if (!filenameWithPath) {
        console.error('File path construction failed');
        return;
      }

      const response = await fetch(`${backendIP}/audio/getaudio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenameWithPath }),
      });

      if (!response.ok) {
        console.error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current.src = audioUrl;
      audioRef.current.onerror = (event) => {
        console.error('Error occurred while loading audio:', event);
        setIsPlaying(false);
        setButtonsDisabled(false);
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setButtonsDisabled(false);
      };

      await new Promise((resolve, reject) => {
        audioRef.current.oncanplaythrough = resolve;
        audioRef.current.onerror = reject;
      });

      await audioRef.current.play();
      fetchAudioOptions(fileName);

      setDisplayWord(fileName.replace('.wav', ''));
      setCorrectWord(fileName);
    } catch (error) {
      console.error('Failed to load audio file:', error);
      setIsPlaying(false);
      setButtonsDisabled(false);
    }
  };

  const fetchAudioOptions = async (fileName) => {
    try {
      const availableFiles = await fetchAvailableFiles();
      const filteredFiles = availableFiles.filter(file => file !== fileName && !playedFiles.has(file));

      if (filteredFiles.length < 3) {
        console.warn('Not enough files to display options');
        return;
      }

      const randomFiles = [];
      while (randomFiles.length < 3) {
        const randomIndex = Math.floor(Math.random() * filteredFiles.length);
        const selectedFile = filteredFiles[randomIndex];
        if (!randomFiles.includes(selectedFile)) {
          randomFiles.push(selectedFile);
        }
      }

      const allOptions = [fileName, ...randomFiles];
      setOptions(shuffleArray(allOptions));
    } catch (error) {
      console.error('Failed to fetch audio options:', error);
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleResponse = async (option) => {
    console.log('Response button clicked:', option);
  
    if (!isPlaying && !buttonsDisabled) {
      setButtonsDisabled(true);
  
      if (option === correctWord) {
        setScore((prevScore) => {
          const newScore = prevScore + 1;
          console.log('Correct answer! Updating score to:', newScore);
          return newScore;
        });
      } else {
        console.log('Wrong answer selected');
      }
  
      setTotalAudioPlayed((prev) => {
        const newTotal = prev + 1;
        console.log('Updating totalAudioPlayed to:', newTotal);
        return newTotal;
      });

      setOptions([]);
      setShowOptions(false);
      setShowDisplay(true);
      
      await fetchSelectedAudio(); 
    }
  };

  const handleCorrect = () => handleResponse(correctWord);
  const handleIncorrect = () => handleResponse('');

  const handleRepeat = () => {
    console.log('Repeat button clicked');
    if (correctWord && !isPlaying) {
      playAudio(correctWord);
    }
  };
  const handleExit = () => {
    console.log('Exit button clicked');
  
    audioRef.current.pause();
    audioRef.current.src = '';
  
    setShowPopup(true);  // Show popup first with the correct score and totalAudioPlayed
  };
  
  const handleClosePopup = () => {
    setShowPopup(false);
    
    // Reset states after popup closes
    setDisplayWord(''); 
    setOptions([]);     
    setPlayedFiles(new Set()); 
    setScore(0);        
    setTotalAudioPlayed(0); 
    navigate('/home');
  };
  

  const fetchSelectedAudio = async () => {
    try {
      const audioFiles = await fetchAvailableFiles();
      const availableFiles = audioFiles.filter(file => !playedFiles.has(file));
      if (availableFiles.length === 0) {
        console.warn('No available files to play');
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableFiles.length);
      const selectedFile = availableFiles[randomIndex];

      setDisplayWord(selectedFile.replace('.wav', ''));
      await playAudio(selectedFile);

      setPlayedFiles((prev) => new Set(prev).add(selectedFile));
      setButtonsDisabled(false);
    } catch (error) {
      console.error('Error fetching audio or options:', error);
      setButtonsDisabled(false);
    }
  };

  const handleShowOptions = () => {
    console.log('Show Options button clicked');
    setShowOptions(!showOptions);
    setShowDisplay(!showDisplay);
  };

  return (
    <div className="test-screen4">
      <Goal g={g} sk={sk} />
      <div className="content">
      
        {showDisplay && (
          <>
            <div className="display-script">
              <span>{displayWord}</span>
            </div>
            <div className="audio-icon" onClick={handleRepeat}>
              <span role="img" aria-label="speaker">🔊</span>
            </div>
          </>
        )}
          <div className="button-row">
        <button className="show-options-button" onClick={handleShowOptions}>
          {showOptions ? 'Hide Options' : 'Show Options'}
        </button>
      </div>
      {showOptions && (
        <div className="option-buttons">
          {options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => handleResponse(option)} // Handle option selection
              disabled={buttonsDisabled}
            >
              {option.replace('.wav', '')}
            </button>
          ))}
        </div>
      )}
      </div>
    
      <div className="button-row">
      <div class="button-row correct-incorrect">
        <button className="correct-button" onClick={handleCorrect} disabled={buttonsDisabled}>Correct</button>
        <button className="incorrect-button" onClick={handleIncorrect} disabled={buttonsDisabled}>Incorrect</button>
        </div>
        <div class="button-row repeat-exit">
        <button className="repeat-button" onClick={handleRepeat} disabled={isPlaying}>Repeat</button>
        <button className="exit-button" onClick={handleExit}>Exit</button>
        </div>
      </div>
      {showPopup && (
        <Popup score={score} totalAudioPlayed={totalAudioPlayed} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default TestScreen4;




