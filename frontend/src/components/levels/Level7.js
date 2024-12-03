import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../controllers/Dropdown';
import Button from '../controllers/Button';
import './Level.css';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';

const Level7 = ({ onPrev, levelData }) => {
  const { updateSelectedOptions } = useContext(DataContext);
  const [selectedOptions, setSelectedOptions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
  

    if (levelData && levelData.skillData) {
      const initialSelectedOptions = {};

      // Assuming each skill object contains a 'type' and 'options' properties
      levelData.skillData.forEach(skill => {
        if (skill.type === 'dropdown' && skill.options) {
          initialSelectedOptions[skill.label] = skill.options[0]; // Default to the first option
        }
      });

     
      setSelectedOptions(initialSelectedOptions);
    } else {
      
    }
  }, [levelData]);

  const handleDropdownSelect = (label, value) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [label]: value
    }));
  };

  const handleNext = () => {
   // console.log('Selected options before navigating:', selectedOptions); // Log selected options before navigation
    updateSelectedOptions(selectedOptions);
    navigate('/instruction');
  };

  // Check if levelData or skillData is available
  if (!levelData || !levelData.skillData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="level-container">
      <div className="header-container">
        <h2>Select the options</h2>
      </div>
      <div className="content-container">
        {levelData.skillData.map((skill, index) => (
          skill.type === 'dropdown' && skill.options && ( // Ensure the skill is a dropdown and has options
            <div key={index} className="skill-container">
              <div className="element-container">
                <label>{skill.label}</label>
                <Dropdown
                  options={skill.options} // Use the skill's options directly
                  selectedOption={selectedOptions[skill.label]} // Get selected option for this skill
                  onSelect={(value) => handleDropdownSelect(skill.label, value)} // Handle option selection
                />
              </div>
            </div>
          )
        ))}
      </div>
      <div className="button-container">
        <Button buttonName="Back" handleClick={onPrev} />
        <Button buttonName="Next" handleClick={handleNext} />
      </div>
    </div>
  );
};

export default Level7;
