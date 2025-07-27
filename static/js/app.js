import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import axios from 'axios';
import DocumentList from './components/DocumentList';
import Editor from './components/Editor';
import Login from './components/Login';
import Signup from './components/Signup';
import './style.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    if (isAuthenticated) {
      axios.patch('/api/auth/users/me/', { preferences: { dark_mode: theme === 'dark' } }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
    }
  }, [theme, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar bg={theme} variant={theme} expand="lg">
        <Container>
          <Navbar.Brand href="/">ThinkFlow</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {isAuthenticated ? (
                <>
                  <Nav.Link href="/documents">Documents</Nav.Link>
                  <Button variant="link" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                  </Button>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href="/login">Login</Nav.Link>
                  <Nav.Link href="/signup">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="mt-3">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/documents" /> : <Navigate to="/login" />} />
          <Route path="/documents" element={isAuthenticated ? <DocumentList /> : <Navigate to="/login" />} />
          <Route path="/editor/:documentId" element={isAuthenticated ? <Editor /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;