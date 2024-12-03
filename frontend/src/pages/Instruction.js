// import React, { useContext, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Layout from '../components/Layout/Layout';
// import DataContext from '../stores/DataContextProvider';
// import dataFlow from '../utils/Dataflow.json'; // Adjust the path as necessary
// import './Instruction.css';

// const Instruction = () => {
//   const { levelCode, skillCode, instruction, updateInstruction, testCode, updateTestCode } = useContext(DataContext);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { selectedOptions } = location.state || {};

//   useEffect(() => {
//     const fetchInstructionData = () => {
//       let foundInstruction = null;

//       const searchInstruction = (items) => {
//         if (!Array.isArray(items)) {
//           return;
//         }
//         for (const item of items) {
//           if (item.levelCode === levelCode && item.skillCode === skillCode) {
//             foundInstruction = item;
//             return;
//           }
//           if (item.item && Array.isArray(item.item)) {
//             searchInstruction(item.item);
//           }
//           if (foundInstruction) return;
//         }
//       };

//       if (Array.isArray(dataFlow.dataFlow)) {
//         searchInstruction(dataFlow.dataFlow);
//       } else {
//         console.error("Invalid dataFlow structure.");
//       }

//       updateInstruction(foundInstruction ? foundInstruction.instruction : null);
//       updateTestCode(foundInstruction ? foundInstruction.testCode : 1); // Update testCode based on found instruction
//     };

//     fetchInstructionData();
//   }, [levelCode, skillCode, updateInstruction, updateTestCode]);

//   const handleNext = () => {
//     switch (testCode) {
//       case 1:
//         navigate('/testscreen1', { state: { selectedOptions } });
//         break;
//       case 2:
//         navigate('/testscreen2', { state: { selectedOptions } });
//         break;
//       case 3:
//         navigate('/testscreen3', { state: { selectedOptions } });
//         break;
//       case 4:
//         navigate('/testscreen4', { state: { selectedOptions } });
//         break;
//       case 5:
//         navigate('/testscreen5', { state: { selectedOptions } });
//         break;
//       case 6:
//         navigate('/testscreen6', { state: { selectedOptions } });
//         break;
//       case 7:
//         navigate('/testscreen7', { state: { selectedOptions } });
//         break;
//       case 8:
//         navigate('/testscreen8', { state: { selectedOptions } });
//         break;
//       case 9:
//         navigate('/testscreen9', { state: { selectedOptions } });
//         break;
//       case 10:
//         navigate('/testscreen10', { state: { selectedOptions } });
//         break;
//       case 11:
//         navigate('/testscreen11', { state: { selectedOptions } });
//         break;
//         case 12:
//           navigate('/testscreen12', { state: { selectedOptions } });
//           break;
//       default:
//         console.error('Invalid testCode:', testCode);
//         navigate('/home'); // Fallback in case of an invalid testCode
//     }
//   };

//   const handleBack = () => {
//     navigate('/home');
//   };

//   if (!instruction) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Layout>
//       <div className="instruction-container">
//         <h1>Instruction</h1>
//         <p>{instruction}</p> {/* Display only the first line of the instruction */}
//         <div className="button-container">
//           <button onClick={handleBack}>Back</button>
//           <button onClick={handleNext}>Start</button>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Instruction;


import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import DataContext from '../stores/DataContextProvider';
import dataFlow from '../utils/Dataflow.json'; // Adjust the path as necessary
import './Instruction.css';

const Instruction = () => {
  const { levelCode, skillCode, instruction, updateInstruction, testCode, updateTestCode } = useContext(DataContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedOptions } = location.state || {}; // Retrieve passed state if available

  useEffect(() => {
    const fetchInstructionData = () => {
      let foundInstruction = null;

      const searchInstruction = (items) => {
        if (!Array.isArray(items)) {
          return;
        }
        for (const item of items) {
          if (item.levelCode === levelCode && item.skillCode === skillCode) {
            foundInstruction = item;
            return;
          }
          if (item.item && Array.isArray(item.item)) {
            searchInstruction(item.item);
          }
          if (foundInstruction) return;
        }
      };

      if (Array.isArray(dataFlow.dataFlow)) {
        searchInstruction(dataFlow.dataFlow);
      } else {
        console.error('Invalid dataFlow structure.');
      }

      updateInstruction(foundInstruction ? foundInstruction.instruction : null);
      updateTestCode(foundInstruction ? foundInstruction.testCode : 1); // Update testCode based on found instruction
    };

    fetchInstructionData();
  }, [levelCode, skillCode, updateInstruction, updateTestCode]);

  const handleNext = () => {
    switch (testCode) {
      case 1:
        navigate('/testscreen1', { state: { selectedOptions } });
        break;
      case 2:
        navigate('/testscreen2', { state: { selectedOptions } });
        break;
      case 3:
        navigate('/testscreen3', { state: { selectedOptions } });
        break;
      case 4:
        navigate('/testscreen4', { state: { selectedOptions } });
        break;
      case 5:
        navigate('/testscreen5', { state: { selectedOptions } });
        break;
      case 6:
        navigate('/testscreen6', { state: { selectedOptions } });
        break;
      case 7:
        navigate('/testscreen7', { state: { selectedOptions } });
        break;
      case 8:
        navigate('/testscreen8', { state: { selectedOptions } });
        break;
      case 9:
        navigate('/testscreen9', { state: { selectedOptions } });
        break;
      case 10:
        navigate('/testscreen10', { state: { selectedOptions } });
        break;
      case 11:
        navigate('/testscreen11', { state: { selectedOptions } });
        break;
      case 12:
        navigate('/testscreen12', { state: { selectedOptions } });
        break;
        case 13:
          navigate('/testscreen13', { state: { selectedOptions } });
          break;
          case 14:
            navigate('/testscreen14', { state: { selectedOptions } });
            break;
      default:
        console.error('Invalid testCode:', testCode);
        navigate('/home'); // Fallback in case of an invalid testCode
    }
  };

  const handleBack = () => {
    
    if (levelCode) {
      alert("levelcode444",levelCode);
      navigate('/level'); // Navigate to the level screen if `levelCode` exists
    } else {
      alert("levelcode555",levelCode);
      navigate('/home'); // Navigate to the home screen if no level is selected
    }
  };

  if (!instruction) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="instruction-container">
        <h1>Instruction</h1>
        <p>{instruction}</p> {/* Display only the first line of the instruction */}
        <div className="button-container">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Start</button>
        </div>
      </div>
    </Layout>
  );
};

export default Instruction;
