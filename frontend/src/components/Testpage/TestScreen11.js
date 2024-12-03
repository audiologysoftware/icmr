

import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';
import backendIP from '../../utils/serverData';
import Popup from '../popup/Popup';
import './TestScreen11.css';
import Goal from '../controllers/Goal';

const TestScreen11 = () => {
    const { g, sk, instruction, selectedOptions, folderPath } = useContext(DataContext);
    const [displayScript, setDisplayScript] = useState('');
    const [score, setScore] = useState(0);
    const [totalAudioPlayed, setTotalAudioPlayed] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [playedFiles, setPlayedFiles] = useState([]);
    const audioRef = useRef(new Audio());
    const abortControllerRef = useRef(new AbortController());
    const navigate = useNavigate();

    const [isTestRunning, setIsTestRunning] = useState(false);
    const [numberOfStimuli, setNumberOfStimuli] = useState(0);
    const [stimulusDuration, setStimulusDuration] = useState(0);
    const [responseWindow, setResponseWindow] = useState(5000);
    const [duration, setDuration] = useState(0); // Duration in seconds
    const [currentStimulusIndex, setCurrentStimulusIndex] = useState(0);
    const [isWithinResponseWindow, setIsWithinResponseWindow] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (selectedOptions && Object.keys(selectedOptions).length > 0) {
            const durationInMinutes = parseInt(selectedOptions['Time Duration']?.label, 10) || 0;
            const numStimuli = parseInt(selectedOptions['Number of Stimuli']?.label, 10) || 0;
            const responseWindowValue = parseInt(selectedOptions['Response Window']?.label, 10) || 5000;
            
            const totalDuration = durationInMinutes * 60;
    
            if (!isNaN(numStimuli) && numStimuli > 0) {
                setNumberOfStimuli(numStimuli);
                setStimulusDuration(Math.min(responseWindowValue / 1000, 5));
                setResponseWindow(responseWindowValue);
                setIsTestRunning(true);
                setPlayedFiles([]);
                setDuration(totalDuration);
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
    }, [folderPath, numberOfStimuli]);

    const fetchSelectedAudio = async () => {
        try {
            abortControllerRef.current = new AbortController();

            const response = await fetch(`${backendIP}/audio/listfiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderPath }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const audioData = await response.json();

            if (Array.isArray(audioData) && audioData.length > 0) {
                const shuffledAudioData = audioData.sort(() => Math.random() - 0.5);
                const availableFiles = shuffledAudioData.slice(0, Math.min(numberOfStimuli, shuffledAudioData.length));
                setPlayedFiles(availableFiles);

                if (availableFiles.length > 0) {
                    playStimuliAtRandomIntervals(availableFiles);
                } else {
                    console.warn('No audio files available to play.');
                }
            } else {
                console.warn('No audio files found in the folder.');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching audio files:', error);
            }
        }
    };

    const generateRandomIntervals = (totalTime, stimuliCount, maxInterval = 35) => {
        const minInterval = 5;  // Minimum gap between audio stimuli in seconds
        let intervals = [];
        let remainingTime = totalTime;
    
        for (let i = 0; i < stimuliCount; i++) {
            const maxPossibleInterval = Math.min(maxInterval, remainingTime / (stimuliCount - i));
            const adjustedMaxInterval = Math.min(maxPossibleInterval, remainingTime - (stimuliCount - i - 1) * minInterval);
            
            const randomInterval = Math.max(
                minInterval,
                Math.floor(Math.random() * (adjustedMaxInterval - minInterval + 1)) + minInterval
            );
            
            intervals.push(randomInterval);
            remainingTime -= randomInterval;
        }
    
        // Distribute any remaining time across all intervals
        if (remainingTime > 0) {
            const distribution = remainingTime / stimuliCount;
            intervals = intervals.map(interval => interval + distribution);
        }
    
        return intervals.map(interval => Math.round(interval * 10) / 10); // Round to one decimal place
    };
    const playStimuliAtRandomIntervals = async (fileList) => {
        const maxInterval = 35; // or whatever maximum you prefer
        const intervals = generateRandomIntervals(duration, numberOfStimuli, maxInterval);
        console.log('Random intervals:', intervals);
    
        for (let i = 0; i < fileList.length; i++) {
            setCurrentStimulusIndex(i);
            await playAudio(fileList[i]);
    
            if (i < fileList.length - 1) {
                const interval = Math.min(intervals[i], maxInterval) * 1000; // Ensure no interval exceeds maxInterval
                console.log(`Waiting for ${interval / 1000} seconds until the next stimulus.`);
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
        setIsTestRunning(false);
    };
    


    const playAudio = async (fileName) => {
        try {
            audioRef.current.pause();
            audioRef.current.src = '';

            setDisplayScript(fileName.replace('.wav', ''));
            const filenameWithPath = `${folderPath}/${fileName}`;
    
            const response = await fetch(`${backendIP}/audio/getaudio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filenameWithPath }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;

            await audioRef.current.play();

            setIsWithinResponseWindow(true);
            await new Promise(resolve => {
                const timer = setTimeout(() => {
                    audioRef.current.pause();
                    resolve();
                }, audioRef.current.duration * 1000);

                audioRef.current.onended = () => {
                    clearTimeout(timer);
                    resolve();
                };
            });

            setTotalAudioPlayed(prev => prev + 1);
            setDisplayScript('');

            await new Promise(resolve => setTimeout(resolve, responseWindow));
            setIsWithinResponseWindow(false);
     
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Failed to load audio file:', error);
            }
        }
    };

    const handleClick = () => {
        if (isWithinResponseWindow) {
            setScore(prev => prev + 1);
            console.log('Correct response! Score incremented.');
        } else {
            console.log('Clicked outside response window. No score.');
        }
    };

    const handleExit = () => {
        console.log('Exit button clicked');
        setShowPopup(true);
        stopTest();
    };

    const stopTest = () => {
        setIsTestRunning(false);
        audioRef.current.pause();
        audioRef.current.src = '';
        clearTimeout(timeoutRef.current);
        abortControllerRef.current.abort();
        setCurrentStimulusIndex(0);
        setIsWithinResponseWindow(false);
        setDisplayScript('');
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
                <Popup score={score} totalAudioPlayed={totalAudioPlayed} onClose={handleClosePopup} />
            )}
        </div>
    );
};

export default TestScreen11;