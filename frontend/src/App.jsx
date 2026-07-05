// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* More routes (register, login, dashboard, assessment) added in later modules */}
    </Routes>
  );
}

export default App;