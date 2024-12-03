import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../controllers/Dropdown';
import Button from '../controllers/Button';
import DataContext from '../../stores/DataContextProvider'; // Import context
import './Level.css';

const Level4 = ({ onNext, onPrev, levelData }) => {
  const { updateSelectedOptions, updateTestdata, updateIsi, updateIbi ,updateCurrentFileCount,updateTotalAudioFiles} = useContext(DataContext);
  const [selectedOptions, setSelectedOptions] = useState({});
 

  const [inputValues, setInputValues] = useState({}); // Handle text input for ISI and IBI

  // Initialize the level and other options based on levelData
  useEffect(() => {
    if (levelData) {
      const initialSelectedOptions = {};
      const initialInputValues = {};

      levelData.skillData.forEach(skill => {
        if (skill.type === 'dropdown') {
          initialSelectedOptions[skill.label] = skill.options[0]; // Default to first dropdown option
        } else if (skill.type === 'text') {
          initialInputValues[skill.label] = ''; // Default text input value
        }
      });

      setSelectedOptions(initialSelectedOptions);
      setInputValues(initialInputValues);
 
    }
  }, [levelData]);

  // Handle dropdown selection
  const handleDropdownSelect = (label, value) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [label]: value,
    }));
    console.log('Updated selected options:', {
      ...selectedOptions,
      [label]: value,
    }); // Log updated selected options
  };

  // Handle text input changes
  const handleTextChange = (label, value) => {
    setInputValues(prevState => ({
      ...prevState,
      [label]: value,
    }));
    console.log('Updated input values:', {
      ...inputValues,
      [label]: value,
    }); // Log updated input values
  };

  // Handle the Next button click
  const handleNext = () => {
    const recallLevel = selectedOptions['Recall Level']?.value || selectedOptions['Recall Level']?.label || null;
    const isi = parseInt(inputValues['ISI'], 10) || 0; // Get ISI from text input, default to 0
    const ibi = parseInt(inputValues['IBI'], 10) || 0; // Get IBI from text input, default to 0

    // Store the selected options, ISI, IBI in context
    updateCurrentFileCount(0);
    updateTotalAudioFiles(0);
    updateSelectedOptions(selectedOptions);
    updateIsi(isi);
    updateIbi(ibi);
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
                  selectedOption={selectedOptions[skill.label]} // Use direct value
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
                  value={inputValues[skill.label] || ''} // Ensure controlled input
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

export default Level4;
