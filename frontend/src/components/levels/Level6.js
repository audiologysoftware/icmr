


import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../controllers/Dropdown';
import Button from '../controllers/Button';
import './Level.css';
import DataContext from '../../stores/DataContextProvider';

const Level6 = ({ levelData,onPrev}) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [inputValues, setInputValues] = useState({});
  const { updateSelectedOptions, updateTestdata,updateIsi,updateIbi} = useContext(DataContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (levelData) {
      const initialSelectedOptions = {};
      const initialInputValues = {};
      levelData.skillData.forEach(skill => {
        if (skill.type === 'dropdown') {
          initialSelectedOptions[skill.label] = skill.options[0].value; // Default to the first option
        } else if (skill.type === 'text') {
          initialInputValues[skill.label] = '';
        }
      });

      setSelectedOptions(initialSelectedOptions);
      setInputValues(initialInputValues);
    }
  }, [levelData]);

  const handleDropdownSelect = (label, value) => {
    setSelectedOptions(prevState => ({ ...prevState, [label]: value }));
  };

  const handleTextChange = (label, value) => {
    setInputValues(prevState => ({ ...prevState, [label]: value }));
  };

  const handleNext = () => {
    const selectedData = [
      selectedOptions['Standard'],
      selectedOptions['Variable'],
      inputValues['ISI'],
      inputValues['IBI']
    ];

    // Validate that none of the fields are empty
    if (selectedData.every(value => value !== '' && value !== undefined)) {
      updateSelectedOptions(selectedOptions); // Update context with selected options
      updateTestdata(selectedData); // Update test data in context
      updateIsi(inputValues['ISI']); // Update ISI in context
      updateIbi(inputValues['IBI']); // Update IBI in context
      navigate('/instruction');
    } else {
      // console.log("Please select all the fields");
    }
  };

  const handleBack = () => {
    onPrev(); // Use onPrev function to navigate back
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
                  selectedOption={selectedOptions[skill.label] || skill.options[0].value}
                  onSelect={(value) => handleDropdownSelect(skill.label, value)}
                />
              </div>
            )}

            {skill.type === 'text' && (
              <div className="element-container">
                <label>{skill.label}(ms) </label>
                <input
                  type="text"
                  placeholder={skill.placeholder}
                  value={inputValues[skill.label]|| ''}
                  onChange={(e) => handleTextChange(skill.label, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="button-container">
        <Button buttonName="Back" handleClick={handleBack} />
        <Button buttonName="Next" handleClick={handleNext} />
      </div>
    </div>
  );
};

export default Level6;

