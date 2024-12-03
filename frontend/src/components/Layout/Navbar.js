


import { useContext } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to get the current route
import './Navbar.css';
import DataContext from '../../stores/DataContextProvider';
import Button from '../controllers/Button';

function Navbar() {
  const { 
    level, 
    updateLevel, 
    updateM, 
    updateSM, 
    updateG, 
    updateSK, 
    updateFolderPath, 
    folderPath 
  } = useContext(DataContext);
  
  const location = useLocation(); // Get the current route

  function handleClick(e) {
    e.preventDefault();
    window.location.href = '/home';
  }

  const handleSignOut = () => {
    window.location.href = '/';
  };

  function handleBack(e) {
    e.preventDefault();

    if (level > 0) {
      updateLevel(prevLevel => prevLevel - 1);
      
      // Resetting context values based on the level
      switch (level) {
        case 1:
          updateM("");
          break;
        case 2:
          updateSM("");
          break;
        case 3:
          updateG("");
          break;
        case 4:
          updateSK("");
          break;
        default:
      }

      // Update folder path by removing the last segment
      if (folderPath) {
        const pathParts = folderPath.split('/'); // Split the path into parts
        pathParts.pop(); // Remove the last part (folder name)
        const newPath = pathParts.join('/'); // Reconstruct the path
        updateFolderPath(newPath); // Update folder path in context
        console.log('New Folder Path after Back:', newPath);
      }
    }
  }

  // Conditionally render the Back button based on the current path
  const showBackButton = location.pathname !== '/level'; // Hide Back button if the current route is '/level'

  return (
    <div className="navContainer">
      <div className="buttonContainer">
        <Button handleClick={handleClick} buttonName={"Homepage"} />
        {showBackButton && (
          <Button handleClick={handleBack} buttonName={"Back"} />
        )}
        <Button handleClick={handleSignOut} buttonName={"Sign out"} />
       
      </div>
    </div>
  );
}

export default Navbar;
