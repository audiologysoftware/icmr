

import React, { useContext } from 'react';
import TestScreen1 from '../components/Testpage/TestScreen1';
import TestScreen2 from '../components/Testpage/TestScreen2';
import TestScreen3 from '../components/Testpage/TestScreen3';
import TestScreen4 from '../components/Testpage/TestScreen4';
import TestScreen5 from '../components/Testpage/TestScreen5';
import TestScreen6 from '../components/Testpage/TestScreen6';
import TestScreen7 from '../components/Testpage/TestScreen7';
import TestScreen8 from '../components/Testpage/TestScreen8';
import TestScreen9 from '../components/Testpage/TestScreen9';
import Layout from '../components/Layout/Layout';
import DataContext from '../stores/DataContextProvider';

const TestPage = () => {
  const { testCode } = useContext(DataContext);

  const getTestScreen = () => {
    // console.log('Rendering TestScreen with testCode:', testCode);
    switch (testCode) {
      case 1:
        return <TestScreen1 />;
      case 2:
        return <TestScreen2 />;
      case 3:
        return <TestScreen3 />;
      case 4:
        return <TestScreen4 />;
      case 5:
        return <TestScreen5 />;
      case 6:
        return <TestScreen6 />;
      case 7:
        return <TestScreen7 />;
      case 8:
        return <TestScreen8 />;
      case 9:
        return <TestScreen9 />;
      default:
        console.error('Invalid testCode:', testCode);
        return <TestScreen1 />; // Default to TestScreen1 if no valid testCode
    }
  };

  return (
    <Layout>
      <div>
        {getTestScreen()} {/* Render the selected TestScreen */}
      </div>
    </Layout>
  );
};

export default TestPage;
