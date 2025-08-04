import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspaces from './pages/Workspaces';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-notion-gray-25">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workspaces" element={<Workspaces />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
