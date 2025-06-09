// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AutomateFineTune from './components/AutomateFineTune';
import MannualFineTune from './components/ManualFineTune';
import HomePage from './components/HomePage';
import WaitingPage from './components/WaitingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/AutomateFineTune" element={<AutomateFineTune />} />
        <Route path="/MannualFineTune" element={<MannualFineTune />} />
        <Route path="/waiting" element={<WaitingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
