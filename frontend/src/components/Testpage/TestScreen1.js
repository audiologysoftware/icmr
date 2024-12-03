import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaVolumeUp, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import backendIP from '../../utils/serverData';
import { getAudio } from '../../utils/AudiofileHandling';
import DataContext from '../../stores/DataContextProvider';
import Goal from '../controllers/Goal';
import Popup from '../popup/Popup';
import './TestScreen1.css';

const TestScreen1 = () => {
  const { sk, g, instruction, selectedOptions, folderPath, isi, ibi } = useContext(DataContext);
  const [audioSet, setAudioSet] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalAudioFilesPlayed, setTotalAudioFilesPlayed] = useState(0);
  const [score, setScore] = useState(0);
  const [buttonColors, setButtonColors] = useState([]);
  const [totalSetsPlayed, setTotalSetsPlayed] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [exitClicked, setExitClicked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAudioFiles, setTotalAudioFiles] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const audioRef = useRef(null);
 
  const timeoutRef = useRef(null);

  const navigate = useNavigate();



  // First pick the file from the backend - totalfileList
  const generateFileSet = async () => {
    // console.log('generateFileSet called');
    const standardFolder = selectedOptions.Standard ? selectedOptions.Standard.value : '';
    const variableFolder = selectedOptions.Variable ? selectedOptions.Variable.value : '';

    const paths = {
      standard: `${folderPath}/standard/${standardFolder}/`,
      variable: `${folderPath}/variable/${variableFolder}/`,
    };

    const [standardFiles, variableFiles] = await Promise.all([
      fetchAudioFiles(paths.standard),
      fetchAudioFiles(paths.variable),
    ]);

    const pickRandomFile = (fileList) => {
      return fileList[Math.floor(Math.random() * fileList.length)];
    };

    // Pick one standard file to play twice
    const standardFileName = pickRandomFile(standardFiles);
    // Pick one variable file to play once
    const variableFileName = pickRandomFile(variableFiles);

    // Create an array with two standard and one variable audio file
    const fileList = [
      { path: `${paths.standard}${standardFileName}`, type: 'standard' },
      { path: `${paths.standard}${standardFileName}`, type: 'standard' },
      { path: `${paths.variable}${variableFileName}`, type: 'variable' },
    ];

    // Shuffle the array to randomize the position of the variable file
    const shuffledFileList = fileList.sort(() => Math.random() - 0.5);

    setAudioSet(shuffledFileList);
    setButtonColors(Array(shuffledFileList.length).fill(''));
    setTotalAudioFiles(shuffledFileList.length);
  };

  const hasGeneratedFileSet = useRef(false); // Ref to track if generateFileSet is called
     useEffect(() => {
    if (!hasGeneratedFileSet.current && !exitClicked) {
      generateFileSet();
      hasGeneratedFileSet.current = true; // Set flag to true after generating files
    }
 }, [selectedOptions, folderPath]);


  // Fetches audio files based on the fileset generated


  const fetchAudioFiles = async (path) => {
    console.log('fetchAudioFiles called with path:', path);
    try {
      const response = await fetch(`${backendIP}/audio/listfiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath: path }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio file list');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching audio file list:', error);
      return [];
    }
  };

  // After audio set is readyt and files are picked from the backend , play it unless currently playing
  useEffect(() => {
    if (audioSet.length > 0 && !isPlaying && !exitClicked) {
      playAudioSet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSet]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [audioSet]);



// Main function to play audio set
const playAudioSet = async () => {
  try {
    setIsPlaying(true); // Start playing

    // Play through the audio set
    for (let i = 0; i < audioSet.length; i++) {
      const { path } = audioSet[i];
      // console.log('Playing Path:', path);

      // Play the audio, wrapped in a Promise
      await new Promise((resolve) => {
        getAudio(path, async (audioUrl) => {
          if (audioUrl) {
            await playAudio(audioUrl); // Play the audio
            // console.log(`Played audio: ${audioUrl}`);
          } else {
            console.error('Audio URL not found:', path);
          }
          resolve(); // Resolve after audio is played
        });
      });

      // Wait for ISI delay between audios
      if (i < audioSet.length - 1) {
        // console.log('Waiting for', isi, 'milliseconds');
        await delay(parseInt(isi, 10) );
      }
    }

    // Mark as not playing when done
    setIsPlaying(false);
      // Log the current score
      const currentScore = correctAnswers; // Variable holding correct answers count
      // console.log(`Score: ${currentScore} / ${totalSetsPlayed}`);
  
      // Increment total sets played only if it's not a repeat
      if (!exitClicked && !isRepeating) {
        setTotalSetsPlayed(prev => prev + 1);
        setTotalAudioFilesPlayed(prev => prev + 1); // Increment for the set played
      }
  

    // Log the state of exit and repeat
    // console.log(`Exit Clicked: ${exitClicked}, Is Repeating: ${isRepeating}`);

    // Handle exit and repeat logic
    if (!exitClicked && isRepeating) {
      // console.log('Waiting for IBI:', ibi, 'milliseconds');
      await startDelay(); // Wait for Inter-Block Interval (IBI)
      // Reset repeating state and play again after IBI
      setIsRepeating(false); // Ensure repeat is reset before the next cycle
      generateFileSet();  // Generate a new set of files for the next playback
    } else if (!exitClicked && !isRepeating) {
      // Handle normal flow when not repeating
      // console.log('Waiting for IBI:', ibi, ' milliseconds');
      await startDelay(); // Wait for Inter-Block Interval (IBI)
      generateFileSet();  // Generate a new set of files for next playback
    }
  } catch (error) {
    console.error('Error during playAudioSet:', error);
    setIsPlaying(false); // Ensure state is reset if an error occurs
  }
};


  const playAudio = (audioUrl) => {
    return new Promise((resolve) => {
      const audioElement = new Audio(audioUrl);
      audioElement.play();
      audioElement.onended = () => {
        resolve();
      };
      audioRef.current = audioElement;
    });
  };

  // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const delay = (ms) => new Promise(resolve => {
    timeoutRef.current = setTimeout(resolve, ms);
  });

  // Start the delay and log its status
  const startDelay = async () => {
    // console.log("Delay started");
    await delay(parseInt(ibi, 10)); // Use the ibi delay (e.g., 4 seconds)
    // console.log("Delay finished");
  };

  // Stop the delay if a repeat occurs
  const stopDelay = () => {
    clearTimeout(timeoutRef.current); // Clear the current timeout
    // console.log("Delay stopped");
  };

  const handleAudioClick = (index) => {
    if (isPlaying || buttonColors[index]) return;

    const selectedAudio = audioSet[index];
    const newButtonColors = [...buttonColors];

    if (selectedAudio.type === 'variable') {
      newButtonColors[index] = 'correct'; // green color for correct (variable)
      setCorrectAnswers(prev => prev + 1);
    } else {
      newButtonColors[index] = 'wrong'; // red color for wrong (standard)
    }

    setButtonColors(newButtonColors);
  };


  const handleExitClick = () => {
    setExitClicked(true);
    setShowPopup(true);
    setIsPlaying(false);
  
    // Stop any ongoing audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Clear any ongoing timeouts
    clearTimeout(timeoutRef.current);
  
    const finalScore = (correctAnswers / totalSetsPlayed) * 100;
    setScore(finalScore.toFixed(2));
  
    setTimeout(() => {
      setShowPopup(true);
    }, 3000);
  };
  

  // Handle repeat button click
  const handleRepeatClick = () => {
    if (audioSet.length > 0 && !isPlaying) {
      setIsRepeating(true); // Set repeating state
      stopDelay(); // Ensure any active delays are stopped
      setButtonColors(Array(audioSet.length).fill('')); // Reset button colors
      setIsPlaying(false); // Ensure that no audio is playing
      playAudioSet(); // Start playing audio set again
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate('/instruction');
  };
  return (
    <div className="test-screen">
       <Goal g={g} sk={sk} />
      <div className="content">
     
        <h4>{instruction}</h4>
        <div className="audio-buttons">
          {audioSet.length === 3 ? (
            audioSet.map((audio, index) => (
              <button
                key={index}
                className={`audio-button ${buttonColors[index]}`}
                onClick={() => handleAudioClick(index)}
                disabled={buttonColors[index] !== ''} // Disable button if already clicked
              >
                <FaVolumeUp className="audio-icon" />
                {index + 1}
              </button>
            ))
          ) : (
            <p>No audio files available.</p>
          )}
        </div>
        <button
          className="repeat-button"
          onClick={handleRepeatClick}
          disabled={isPlaying || audioSet.length === 0}
        >
          <FaRedo /> Repeat
        </button>
      </div>
      <button className="exit-button" onClick={handleExitClick}>
        Exit
      </button>

      {showPopup && (
        <Popup
          score={`${correctAnswers}`} // Display score as correctAnswers/totalSetsPlayed
          totalAudioPlayed={totalSetsPlayed}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default TestScreen1;

