// src/components/Dashboard/Dashboard.jsx
import { useLocation } from 'react-router-dom';

function Dashboard() {
  const location = useLocation();
  const learner = location.state?.learner;

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Dashboard (placeholder — built in Module 10)</h1>
      {learner ? (
        <pre>{JSON.stringify(learner, null, 2)}</pre>
      ) : (
        <p>No learner data received (navigated here directly without logging in).</p>
      )}
    </div>
  );
}

export default Dashboard;