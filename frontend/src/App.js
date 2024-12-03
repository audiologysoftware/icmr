// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Home from './pages/Home';
// import LoginPage from './pages/LoginPage';
// import Levels from './pages/Levels';
// import Instruction from './pages/Instruction';
// import TestPage from './pages/TestPage'; // Ensure this file is imported
// import Layout from './components/Layout/Layout'; // Import the Layout component
// import TestScreen1 from './components/Testpage/TestScreen1';
// import TestScreen2 from './components/Testpage/TestScreen2';
// import TestScreen3 from './components/Testpage/TestScreen3';
// import { DataContextProvider } from './stores/DataContextProvider';
// import TestScreen4 from './components/Testpage/TestScreen4';
// import TestScreen5 from './components/Testpage/TestScreen5';
// import TestScreen6 from './components/Testpage/TestScreen6';
// import TestScreen7 from './components/Testpage/TestScreen7';
// import TestScreen8 from './components/Testpage/TestScreen8';
// import TestScreen9 from './components/Testpage/TestScreen9';
// import TestScreen10 from './components/Testpage/TestScreen10';
// import TestScreen11 from './components/Testpage/TestScreen11';
// import TestScreen12 from './components/Testpage/TestScreen12';


// function App() {
//   return (
//     <DataContextProvider>
//       <Router>
//         <Layout>
//           <Routes>
//             <Route path="/" element={<LoginPage />} />
//             <Route path="/home" element={<Home />} />
//             <Route path="/level" element={<Levels />} />
//             <Route path="/instruction" element={<Instruction />} />
//             <Route path="/testscreen1" element={<TestScreen1 />} />
//             <Route path="/testscreen2" element={<TestScreen2 />} />
//             <Route path="/testscreen3" element={<TestScreen3 />} />
//             <Route path="/testscreen4" element={<TestScreen4 />} />
//             <Route path="/testscreen5" element={<TestScreen5 />} />
//             <Route path="/testscreen6" element={<TestScreen6 />} />
//             <Route path="/testscreen7" element={<TestScreen7/>} />
//             <Route path="/testscreen8" element={<TestScreen8/>} />
//             <Route path="/testscreen9" element={<TestScreen9/>} />
//             <Route path="/testscreen10" element={<TestScreen10/>} />
//             <Route path="/testscreen11" element={<TestScreen11/>} />
//             <Route path="/testscreen12" element={<TestScreen12/>} />
//           </Routes>
//         </Layout>
//       </Router>
//     </DataContextProvider>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Levels from './pages/Levels';
import Instruction from './pages/Instruction';
import TestPage from './pages/TestPage'; 
import Layout from './components/Layout/Layout'; 
import TestScreen1 from './components/Testpage/TestScreen1';
import TestScreen2 from './components/Testpage/TestScreen2';
import TestScreen3 from './components/Testpage/TestScreen3';
import TestScreen4 from './components/Testpage/TestScreen4';
import TestScreen5 from './components/Testpage/TestScreen5';
import TestScreen6 from './components/Testpage/TestScreen6';
import TestScreen7 from './components/Testpage/TestScreen7';
import TestScreen8 from './components/Testpage/TestScreen8';
import TestScreen9 from './components/Testpage/TestScreen9';
import TestScreen10 from './components/Testpage/TestScreen10';
import TestScreen11 from './components/Testpage/TestScreen11';
import TestScreen12 from './components/Testpage/TestScreen12';
import { DataContextProvider } from './stores/DataContextProvider';
import TestScreen13 from './components/Testpage/TestScreen13';
import TestScreen14 from './components/Testpage/TestScreen14';

function App() {
  return (
    <DataContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/level" element={<Levels />} />
                  <Route path="/instruction" element={<Instruction />} />
                  <Route path="/testscreen1" element={<TestScreen1 />} />
                  <Route path="/testscreen2" element={<TestScreen2 />} />
                  <Route path="/testscreen3" element={<TestScreen3 />} />
                  <Route path="/testscreen4" element={<TestScreen4 />} />
                  <Route path="/testscreen5" element={<TestScreen5 />} />
                  <Route path="/testscreen6" element={<TestScreen6 />} />
                  <Route path="/testscreen7" element={<TestScreen7 />} />
                  <Route path="/testscreen8" element={<TestScreen8 />} />
                  <Route path="/testscreen9" element={<TestScreen9 />} />
                  <Route path="/testscreen10" element={<TestScreen10 />} />
                  <Route path="/testscreen11" element={<TestScreen11 />} />
                  <Route path="/testscreen12" element={<TestScreen12 />} />
                  <Route path="/testscreen13" element={<TestScreen13/>} />
                  <Route path="/testscreen14" element={<TestScreen14 />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </DataContextProvider>
  );
}

export default App;
