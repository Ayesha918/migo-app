import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
import Dashboard from './components/Dashboard/Dashboard';
// ...
<Route path="/dashboard" element={<Dashboard />} />