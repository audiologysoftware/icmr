

// import React, { useState, useEffect, useContext } from 'react';
// import Dropdown from '../controllers/Dropdown';
// import Button from '../controllers/Button';
// import './Level.css';
// import DataContext from '../../stores/DataContextProvider';
// import { useNavigate } from 'react-router-dom';

// const Level5 = ({ onPrev, levelData }) => {
//   const { updateSelectedOptions } = useContext(DataContext);
//   const [selectedOptions, setSelectedOptions] = useState({});
//   const [filteredNoiseLevelOptions, setFilteredNoiseLevelOptions] = useState([]);
//   const [filteredCutOffOptions, setFilteredCutOffOptions] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (levelData) {
//       const initialSelectedOptions = {};
//       const noiseLevelOptions = levelData.skillData.find(skill => skill.label === 'Noise level')?.options || [];
//       const cutOffOptions = levelData.skillData.find(skill => skill.label === 'Cut-Off Frequency')?.options || [];

//       // Set initial selected options for both dropdowns
//       levelData.skillData.forEach(skill => {
//         if (skill.type === 'dropdown') {
//           initialSelectedOptions[skill.label] = skill.options[0]; // Default to the first option
//         }
//       });

//       setSelectedOptions(initialSelectedOptions);
//       setFilteredNoiseLevelOptions(noiseLevelOptions);
//       setFilteredCutOffOptions(cutOffOptions);
//     }
//   }, [levelData]);

//   const handleDropdownSelect = (label, value) => {
//     setSelectedOptions(prevState => {
//       const newSelectedOptions = { ...prevState, [label]: value };

//       // Filter logic for noise levels based on noise type selection
//       if (label === 'Noise type') {
//         if (value.value === 'nonoise') {
//           // Only show "Quiet" if 'Noise type' is set to 'nonoise'
//           setFilteredNoiseLevelOptions([{ label: 'Quiet', value: 'Quiet' }]);
//           newSelectedOptions['Noise level'] = { label: 'Quiet', value: 'Quiet' }; // Set Noise level to Quiet
//         } else {
//           const allNoiseLevels = levelData.skillData.find(skill => skill.label === 'Noise level')?.options || [];
//           setFilteredNoiseLevelOptions(allNoiseLevels.filter(option => option.value !== 'Quiet'));
//           newSelectedOptions['Noise level'] = allNoiseLevels[0]; // Default to the first available option
//         }
//       }

//       // Update cut-off options as needed
//       if (label === 'Filter type') {
//         const allCutOffOptions = levelData.skillData.find(skill => skill.label === 'Cut-Off Frequency')?.options || [];
//         setFilteredCutOffOptions(allCutOffOptions);
//       }

//       return newSelectedOptions;
//     });
//   };

//   const handleNext = () => {
//     updateSelectedOptions(selectedOptions);
//     navigate('/instruction');
//   };

//   if (!levelData) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="level-container">
//       <div className="header-container">
//         <h2>Select the options</h2>
//       </div>
//       <div className="content-container">
//         {levelData.skillData.map((skill, index) => (
//           <div key={index} className="skill-container">
//             {skill.type === 'dropdown' && (
//               <div className="element-container">
//                 <label>{skill.label}</label>
//                 <Dropdown
//                   options={
//                     skill.label === 'Noise level' ? filteredNoiseLevelOptions :
//                     skill.label === 'Cut-Off Frequency' ? filteredCutOffOptions :
//                     skill.options
//                   }
//                   selectedOption={selectedOptions[skill.label]?.value}
//                   onSelect={(value) => handleDropdownSelect(skill.label, value)}
//                 />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//       <div className="button-container">
//         <Button buttonName="Back" handleClick={onPrev} />
//         <Button buttonName="Next" handleClick={handleNext} />
//       </div>
//     </div>
//   );
// };

// export default Level5;

import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../controllers/Dropdown';
import Button from '../controllers/Button';
import './Level.css';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';

const Level5 = ({ onPrev, levelData }) => {
  const { updateSelectedOptions } = useContext(DataContext);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [filteredNoiseLevelOptions, setFilteredNoiseLevelOptions] = useState([]);
  const [filteredCutOffOptions, setFilteredCutOffOptions] = useState([]);
  const [nonoiseTimestamp, setNonoiseTimestamp] = useState(null); // Track when "nonoise" is selected
  const navigate = useNavigate();

  useEffect(() => {
    if (levelData) {
      const initialSelectedOptions = {};
      const noiseLevelOptions = levelData.skillData.find(skill => skill.label === 'Noise level')?.options || [];
      const cutOffOptions = levelData.skillData.find(skill => skill.label === 'Cut-Off Frequency')?.options || [];

      // Set initial selected options for both dropdowns
      levelData.skillData.forEach(skill => {
        if (skill.type === 'dropdown') {
          initialSelectedOptions[skill.label] = skill.options[0]; // Default to the first option
        }
      });

      setSelectedOptions(initialSelectedOptions);
      setFilteredNoiseLevelOptions(noiseLevelOptions);
      setFilteredCutOffOptions(cutOffOptions);
    }
  }, [levelData]);

  const handleDropdownSelect = (label, value) => {
    setSelectedOptions(prevState => {
      const newSelectedOptions = { ...prevState, [label]: value };

      // Handle "Noise type" selection
      if (label === 'Noise type') {
        if (value.value === 'nonoise') {
          setNonoiseTimestamp(Date.now()); // Record timestamp when "nonoise" is selected

          // Only show "Quiet" if 'Noise type' is set to 'nonoise'
          setFilteredNoiseLevelOptions([{ label: 'Quiet', value: 'Quiet' }]);
          newSelectedOptions['Noise level'] = { label: 'Quiet', value: 'Quiet' }; // Set Noise level to Quiet
        } else {
          setNonoiseTimestamp(null); // Reset timestamp
          const allNoiseLevels = levelData.skillData.find(skill => skill.label === 'Noise level')?.options || [];
          setFilteredNoiseLevelOptions(allNoiseLevels.filter(option => option.value !== 'Quiet'));
          newSelectedOptions['Noise level'] = allNoiseLevels[0]; // Default to the first available option
        }
      }

      // Handle "Filter type" selection
      if (label === 'Filter type') {
        const allCutOffOptions = levelData.skillData.find(skill => skill.label === 'Cut-Off Frequency')?.options || [];
        setFilteredCutOffOptions(allCutOffOptions);
      }

      return newSelectedOptions;
    });
  };

  const handleNext = () => {
    if (nonoiseTimestamp) {
      const timeElapsed = (Date.now() - nonoiseTimestamp) / 1000; // Time in seconds
      console.log(`Time to select "Quiet" after "nonoise": ${timeElapsed} seconds`);
    }
    updateSelectedOptions(selectedOptions);
    navigate('/instruction');
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
                  options={
                    skill.label === 'Noise level' ? filteredNoiseLevelOptions :
                    skill.label === 'Cut-Off Frequency' ? filteredCutOffOptions :
                    skill.options
                  }
                  selectedOption={selectedOptions[skill.label]?.value}
                  onSelect={(value) => handleDropdownSelect(skill.label, value)}
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

export default Level5;

