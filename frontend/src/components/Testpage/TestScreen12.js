
import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup';
import './TestScreen11.css';
import Goal from '../controllers/Goal';

const TestScreen12 = () => {
    const { g, sk, instruction, selectedOptions, folderPath } = useContext(DataContext);
    const [displayScript, setDisplayScript] = useState('');
    const [totalAudioPlayed, setTotalAudioPlayed] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [playedFiles, setPlayedFiles] = useState([]);
    const audioRef = useRef(new Audio());
    const abortControllerRef = useRef(new AbortController());
    const navigate = useNavigate();

    const [isTestRunning, setIsTestRunning] = useState(false);
    const [numberOfStimuli, setNumberOfStimuli] = useState(0);
    const [targetStimuli, setTargetStimuli] = useState('');
    const [targetPercentage, setTargetPercentage] = useState(0);
    const [duration, setDuration] = useState(300); // Default duration in seconds

    const [targetScore, setTargetScore] = useState(0);
    const [nonTargetScore, setNonTargetScore] = useState(0);
    const [targetStimulusCount, setTargetStimulusCount] = useState(0);
    const [nonTargetStimulusCount, setNonTargetStimulusCount] = useState(0);

    const [currentStimulusIndex, setCurrentStimulusIndex] = useState(0);
    const timeoutRef = useRef(null);
    const [responseWindow, setResponseWindow] = useState(3); // 3 seconds for response window

    useEffect(() => {
        if (selectedOptions && Object.keys(selectedOptions).length > 0) {
            const numStimuli = parseInt(selectedOptions['Number of Stimuli']?.label, 10) || 0;
            const targetStimuliLabel = selectedOptions['Target Stimuli']?.toString() || '';
            const targetPercentageValue = selectedOptions['Target Percentage'] ?
                parseInt(selectedOptions['Target Percentage'], 10) : 0;

            console.log('Parsed Target Stimuli:', targetStimuliLabel);
            console.log('Parsed Target Percentage:', targetPercentageValue);
            console.log('Selected Options:', selectedOptions);

            if (!isNaN(numStimuli) && numStimuli > 0) {
                setNumberOfStimuli(numStimuli);
                setTargetStimuli(targetStimuliLabel);
                setTargetPercentage(targetPercentageValue);
                setIsTestRunning(true);
                setPlayedFiles([]);
            } else {
                console.error('Invalid Number of Stimuli:', numStimuli);
            }
        }
    }, [selectedOptions]);

    useEffect(() => {
        if (folderPath && numberOfStimuli > 0) {
            fetchSelectedAudio();
        }

        return () => {
            audioRef.current.pause();
            audioRef.current.src = '';
            abortControllerRef.current.abort();
        };
    }, [folderPath, numberOfStimuli, targetStimuli, targetPercentage]);

    const fetchSelectedAudio = async () => {
        try {
            // Reset scores at the start of fetching audio
            setTargetScore(0);
            setNonTargetScore(0);
            setTargetStimulusCount(0);
            setNonTargetStimulusCount(0);
            setTotalAudioPlayed(0);

            abortControllerRef.current = new AbortController();

            const response = await fetch(`${backendIP}/audio/listfiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderPath }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error fetching audio list: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const audioData = await response.json();
            const validAudioFiles = audioData.filter(file => file.trim().endsWith('.wav')).map(file => file.trim());
            const normalizedTargetStimulus = targetStimuli.trim().replace(/\s+/g, '').toLowerCase();

            console.log('Normalized Target Stimulus:', normalizedTargetStimulus);

            const numTargetStimuli = Math.round((targetPercentage / 100) * numberOfStimuli);
            const numStandardStimuli = numberOfStimuli - numTargetStimuli;

            console.log(`Number of Target Stimuli: ${numTargetStimuli}, Standard Stimuli: ${numStandardStimuli}`);

            if (validAudioFiles.length > 0) {
                const targetStimuliFiles = validAudioFiles
                    .filter(file => {
                        const normalizedFileName = file.replace(/\s+/g, '').replace('.wav', '').toLowerCase();
                        return normalizedFileName === normalizedTargetStimulus;
                    })
                    .slice(0, numTargetStimuli);

                const standardStimuliFiles = validAudioFiles
                    .filter(file => {
                        const normalizedFileName = file.replace(/\s+/g, '').replace('.wav', '').toLowerCase();
                        return normalizedFileName !== normalizedTargetStimulus;
                    })
                    .slice(0, numStandardStimuli);

                console.log('Target Stimuli Files:', targetStimuliFiles);
                console.log('Standard Stimuli Files:', standardStimuliFiles);

                if (targetStimuliFiles.length > 0 || standardStimuliFiles.length > 0) {
                    const combinedFiles = [...targetStimuliFiles, ...standardStimuliFiles].sort(() => Math.random() - 0.5);
                    setPlayedFiles(combinedFiles);
                    playStimuliAtRandomIntervals(combinedFiles);
                } else {
                    console.error('No matching audio files found for the specified criteria.');
                }
            } else {
                console.error('No valid audio files found in the specified folder.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error in fetchSelectedAudio:', error);
            }
        }
    };

    const playStimuliAtRandomIntervals = async (fileList) => {
        const intervals = generateRandomIntervals(duration, numberOfStimuli);
        console.log('Random intervals:', intervals);

        for (let i = 0; i < fileList.length; i++) {
            setCurrentStimulusIndex(i);
            await playAudio(fileList[i]);

            setDisplayScript(fileList[i].replace('.wav', ''));

            timeoutRef.current = setTimeout(() => {
                setDisplayScript('');
            }, responseWindow * 1000);

            if (i < fileList.length - 1) {
                const interval = intervals[i] * 1000;
                console.log(`Waiting for ${interval / 1000} seconds until the next stimulus.`);
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
        setIsTestRunning(false);
    };

    const generateRandomIntervals = (totalTime, stimuliCount, minInterval = 5, maxInterval = 35) => {
        let intervals = [];
        let remainingTime = totalTime;

        for (let i = 0; i < stimuliCount; i++) {
            const randomInterval = Math.max(minInterval, Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval);
            intervals.push(randomInterval);
            remainingTime -= randomInterval;
        }

        if (remainingTime > 0 && stimuliCount > 0) {
            const distribution = remainingTime / stimuliCount;
            intervals = intervals.map(interval => interval + distribution);
        }

        return intervals.map(interval => Math.round(interval * 10) / 10);
    };

    const playAudio = async (fileName) => {
        try {
            audioRef.current.pause();
            audioRef.current.src = '';

            const filenameWithPath = `${folderPath}/${fileName}`;

            const response = await fetch(`${backendIP}/audio/getaudio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenameWithPath }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error fetching audio file: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;

            await audioRef.current.play();

            // Increment the stimulus count
            const isTargetStimulus = fileName.includes(targetStimuli);
            if (isTargetStimulus) {
                setTargetStimulusCount(prev => prev + 1);
            } else {
                setNonTargetStimulusCount(prev => prev + 1);
            }

            setDisplayScript(fileName.replace('.wav', ''));
            setTotalAudioPlayed(prev => prev + 1);

            // Set up the response window
            timeoutRef.current = setTimeout(() => {
                setDisplayScript('');
            }, responseWindow * 1000);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error in playAudio:', error);
            }
        }
    };

    const handleClick = () => {
        if (!isTestRunning || displayScript === '') return;

        const currentStimulus = playedFiles[currentStimulusIndex];
        if (currentStimulus) {
            const isTargetStimulus = currentStimulus.includes(targetStimuli);

            if (isTargetStimulus) {
                setTargetScore(prev => prev + 1);
            } else {
                setNonTargetScore(prev => prev + 1);
            }

            console.log(`${isTargetStimulus ? 'Target' : 'Non-target'} stimulus clicked.`);
        }
    };

    const handleExit = () => {
        setShowPopup(true);
        setIsTestRunning(false);
        audioRef.current.pause();
        audioRef.current.src = '';
        abortControllerRef.current.abort();
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        navigate('/home');
    };
    return (
        <div className="test-screen11">
        <Goal g={g} sk={sk} />
            <div className="content">
            
                <h4>{instruction}</h4>
                <div className="audio-icon" onClick={() => audioRef.current && audioRef.current.play()}>
                    <span role="img" aria-label="speaker">🔊</span>
                </div>
                <h2 className="display-script">{displayScript}</h2>
            </div>
            <div className="button-row-index">
                <button className="click-button" onClick={handleClick} disabled={!isTestRunning}>
                    Click
                </button>
                <button className="exit-button" onClick={handleExit}>Exit</button>
            </div>
            {showPopup && (
                <Popup
                    targetScore={targetScore}
                    targetStimulusCount={targetStimulusCount}
                    nonTargetScore={nonTargetScore}
                    nonTargetStimulusCount={nonTargetStimulusCount}
                    onClose={handleClosePopup}
                    isTestScreen12={true} // Indicate this is TestScreen12
                />
            )}
        </div>
    );
};

export default TestScreen12;


