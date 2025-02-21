// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Statistics from './components/Statistics';
import Map from './components/Map';
import ThemeToggleButton from './components/ThemeToggleButton';
import './App.css';

const App: React.FC = () => {
    return (
        <Router>
            <Navbar onStatisticsClick={() => {}} />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Map />} />
                    <Route path="/statistics" element={<Statistics />} />
                </Routes>
            </div>
            <ThemeToggleButton />
        </Router>
    );
};

export default App;