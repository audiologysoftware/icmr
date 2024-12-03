

import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../controllers/Dropdown';
import Button from '../controllers/Button';
import DataContext from '../../stores/DataContextProvider';
import './Level.css';

// Mapping numbers to folder names
const numberToStringMap = {
  5: 'fivesti',
  10: 'tensti',
  15: 'fifteensti',
  20: 'twentysti',
  25: 'twentyfivesti',
  30: 'thirtysti',
  35: 'thirtyfivesti',
  40: 'fourtysti',
  45: 'fourtyfivesti',
  50: 'fiftysti',
  55: 'fiftyfivesti',
  60: 'sixtysti',
  65: 'sixtyfivesti',
  70: 'seventysti',
  75: 'seventyfivesti',
  80: 'eightysti',
  85: 'eightyfivesti',
  90: 'ninetysti',
  95: 'ninetyfivesti',
  100: 'hundredsti'
};

// Define base folder paths
const baseFolderPaths = [
  "cognition\\cognitive\\cogsustained\\cogsylsus",
  "cognition\\cognitive\\cogsustained\\cogwordsus",
  "cognition\\cognitive\\cogsustained\\cogsentsus"
];

const Level2 = ({ onNext, onPrev, levelData }) => {
  const {
    updateSelectedOptions,
    updateDuration,
    updateNumberOfStimuli,
    updateResponseWindow,
    updateFolderPath
  } = useContext(DataContext);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [selectedBaseFolderPath, setSelectedBaseFolderPath] = useState(baseFolderPaths[0]); // Default to the first path

  useEffect(() => {
    if (levelData) {
      const initialSelectedOptions = {};
      const initialInputValues = {};

      levelData.skillData.forEach(skill => {
        if (skill.type === 'dropdown') {
          initialSelectedOptions[skill.label] = skill.options[0];
        } else if (skill.type === 'text') {
          initialInputValues[skill.label] = '';
        }
      });

      setSelectedOptions(initialSelectedOptions);
      setInputValues(initialInputValues);
    }
  }, [levelData]);

  const handleDropdownSelect = (label, value) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [label]: value,
    }));
  };
  const handleTextChange = (label, value) => {
    setInputValues(prevState => ({
      ...prevState,
      [label]: value,
    }));
  };
  const handleNext = () => {
    const selectedStimuli = selectedOptions["Number of Stimuli"];
    const numberOfStimuli = parseInt(selectedStimuli.label, 10);
    if (isNaN(numberOfStimuli) || numberOfStimuli <= 0) {

      return;
    }
    const folderName = numberToStringMap[numberOfStimuli] || '';
    if (!folderName) {
      return;
    }
    const duration = parseInt(selectedOptions["Time Duration"].label, 10) || 5;
    const responseWindow = parseInt(inputValues["Response Window"], 10) || 1000;

    // Update the folder path based on the selected base path and folder name
    const folderPath = `${selectedBaseFolderPath}\\${folderName}`;

    // Update the context with the selected options
    const updatedOptions = {
      'Time Duration': selectedOptions["Time Duration"],
      'Number of Stimuli': selectedOptions["Number of Stimuli"],
      'Response Window': responseWindow
    };

    updateSelectedOptions(updatedOptions);
    updateDuration(duration * 60000); // Convert minutes to milliseconds
    updateNumberOfStimuli(numberOfStimuli);
    updateResponseWindow(responseWindow);
    updateFolderPath(folderPath);
    onNext();
  };

  if (!levelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="level-container">
      <div className="header-container">
        <h2>Select the options</h2>
      </div>
      <div className="content-container">
        {levelData.skillData.map((skill, index) => (
          <div key={index} className="skill-container">
            {skill.type === 'dropdown' && (
              <div className="element-container">
                <label>{skill.label}</label>
                <Dropdown
                  options={skill.options}
                  selectedOption={selectedOptions[skill.label]}
                  onSelect={(value) => handleDropdownSelect(skill.label, value)}
                />
              </div>
            )}
            {skill.type === 'text' && (
              <div className="element-container">
                <label>{skill.label}(ms)</label>
                <input
                  type="text"
                  placeholder={skill.placeholder}
                  value={inputValues[skill.label] || ''}
                  onChange={(e) => handleTextChange(skill.label, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="button-container">
        <Button buttonName="Back" handleClick={onPrev} />
        <Button buttonName="Next" handleClick={handleNext} />
      </div>
    </div>
  );
};

export default Level2;
