
import React, { useContext, useEffect, useState } from 'react';
import Card from './Card';
import './CardList.css';
import processDataFlow from '../../utils/DataController';
import DataContext from '../../stores/DataContextProvider';
import { useNavigate } from 'react-router-dom';

const CardList = () => {
  const { 
    m, sm, g, sk, level, levelCode, skillCode, 
    updateM, updateSM, updateG, updateSK, updateLevel, 
    updateLevelCode, updateSkillCode, updateFolderPath, folderPath 
  } = useContext(DataContext);
  const [cardList, setCardList] = useState([]);
  const navigate = useNavigate();

  const baseDirectory = '/'; // Base directory

  useEffect(() => {
    // Navigate to instruction if level is invalid
    if (level === undefined || level < 0 || level > 4) {
      navigate('/instruction');
      return;
    }

    if (level < 4) {
      const data = processDataFlow(m, sm, g, sk);
      if (Array.isArray(data)) {
        setCardList(data);
      } else {
        console.error("processDataFlow did not return an array", data);
      }
    } else if (level === 4) {
      if (levelCode) {
        navigate('/level');
      } else {
        navigate('/instruction');
      }
    }
  }, [m, sm, g, sk, level, levelCode, skillCode, navigate]);

  const cardClick = (card) => {
    const { title, levelCode, skillCode, folderName } = card;

    // Update folderPath by appending the new folder name
    const newFolderPath = folderPath 
      ? `${folderPath}/${folderName}` 
      : `${baseDirectory}/${folderName}`;

    switch(level) {
      case 0:
        updateM(title);
        updateLevel(1);
        break;
      case 1:
        updateSM(title);
        updateLevel(2);
        break;
      case 2:
        updateG(title);
        updateLevel(3);
        break;
      case 3:
        updateSK(title);
        updateLevel(4);
        break;
      default:
        navigate('/instruction');
        return;
    }

    updateLevelCode(levelCode);
    updateSkillCode(skillCode);
    updateFolderPath(newFolderPath); // Update the folder path
  
  };

  const handleBack = () => {
    // Handle back navigation by removing the last folder name
    if (folderPath) {
      const pathParts = folderPath.split('/'); // Split the path into parts
      pathParts.pop(); // Remove the last part (folder name)
      const newPath = pathParts.join('/'); // Reconstruct the path
      updateFolderPath(newPath); // Update folder path in context
      console.log('New Folder Path after Back:', newPath);
    }
    // Additional logic for back navigation can be added here
    navigate(-1); // Navigate back in history
  };

  return (
    <div className='cardlist'>
   
      {cardList.length > 0 ? (
        cardList.map((card, index) => (
          <Card 
            key={index} 
            title={card.title} 
            levelCode={card.levelCode} 
            skillCode={card.skillCode} 
            handleClick={() => cardClick(card)} 
          />
        ))
      ) : (
        <p>No cards available.</p>
      )}
    </div>
  );
};

export default CardList;
