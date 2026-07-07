import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Register from './components/Register/Register';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;