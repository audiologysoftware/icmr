

// import React from 'react';
// import './Popup.css';

// const Popup = ({
//   score,
//   totalAudioPlayed,
//   memoryScore,
//   sequencingScore,
//   distractionRawScore,
//   distractionScore,
//   onClose,
//   isTestScreen6,
//   isTestScreen7,
//   isTestScreen8,
//   isTestScreen9,
//   isTestScreen10,
// }) => {
//   // Check if the current screen involves memory and sequencing tests
//   const isMemoryAndSequencingScreen = isTestScreen6 || isTestScreen7 || isTestScreen8 || isTestScreen9 || isTestScreen10;

//   return (
//     <div className="popup-overlay">
//       <div className="popup-container">
//         <h2 className="popup-title">Results</h2>

//         {isMemoryAndSequencingScreen ? (
//           <div className="popup-scores">
//             <p className="memory-score">Memory Score: {memoryScore}</p>
//             <p className="sequencing-score">Sequencing Score: {sequencingScore}</p>
//             {/* Display the distraction raw score and distraction score for TestScreen8, TestScreen9, and TestScreen10 */}
//             {(isTestScreen8 || isTestScreen9 || isTestScreen10) && (
//               <>
//                 <p className="distraction-score">Distraction Raw Score: {distractionRawScore}</p>
//                 <p className="distraction-score">Distraction Score: {distractionScore}</p>
//               </>
//             )}
//           </div>
//         ) : (
//           <>
//             <p className="popup-score">
//               <span className="correct-answers">{score}</span> / {totalAudioPlayed}
//             </p>
//             <p className="popup-text">You answered {score} out of {totalAudioPlayed} correctly!</p>
//           </>
//         )}

//         <button className="popup-close-button" onClick={onClose}>
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Popup;


import React from 'react';
import './Popup.css';

const Popup = ({
  score,
  totalAudioPlayed,
  memoryScore,
  sequencingScore,
  distractionRawScore,
  distractionScore,
  targetScore, // New props
  nonTargetScore, // New props
  targetStimulusCount, // New props
  nonTargetStimulusCount, // New props
  onClose,
  isTestScreen6,
  isTestScreen7,
  isTestScreen8,
  isTestScreen9,
  isTestScreen10,
  isTestScreen12, // New prop to check for TestScreen12
}) => {
  // Check if the current screen involves memory and sequencing tests
  const isMemoryAndSequencingScreen = isTestScreen6 || isTestScreen7 || isTestScreen8 || isTestScreen9 || isTestScreen10;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2 className="popup-title">Results</h2>

        {isTestScreen12 ? ( // Check for TestScreen12
          <div className="popup-scores">
            <p className="target-score">Target Score: {targetScore} / {targetStimulusCount}</p>
            <p className="non-target-score">Non-Target Score: {nonTargetScore} / {nonTargetStimulusCount}</p>
          </div>
        ) : isMemoryAndSequencingScreen ? (
          <div className="popup-scores">
            <p className="memory-score">Memory Score: {memoryScore}</p>
            <p className="sequencing-score">Sequencing Score: {sequencingScore}</p>
            {/* Display the distraction raw score and distraction score for TestScreen8, TestScreen9, and TestScreen10 */}
            {(isTestScreen8 || isTestScreen9 || isTestScreen10) && (
              <>
                <p className="distraction-score">Distraction Raw Score: {distractionRawScore}</p>
                <p className="distraction-score">Distraction Score: {distractionScore}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="popup-score">
              <span className="correct-answers">{score}</span> / {totalAudioPlayed}
            </p>
            <p className="popup-text">You answered {score} out of {totalAudioPlayed} correctly!</p>
          </>
        )}

        <button className="popup-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;

