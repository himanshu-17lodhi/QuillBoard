import React, { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/documents/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(response => setDocuments(response.data))
      .catch(error => console.error('Error fetching documents:', error));

    const interval = setInterval(() => {
      axios.get('/api/documents/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      })
        .then(response => setDocuments(response.data));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const createDocument = () => {
    axios.post('/api/documents/', { title: 'New Document', content: { blocks: [] } }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(response => navigate(`/editor/${response.data.id}`))
      .catch(error => console.error('Error creating document:', error));
  };

  return (
    <div>
      <h1>Documents</h1>
      <Button variant="primary" className="mb-3" onClick={createDocument}>Create New Document</Button>
      <ListGroup>
        {documents.map(doc => (
          <ListGroup.Item key={doc.id} action onClick={() => navigate(`/editor/${doc.id}`)}>
            {doc.title} <small>(Updated: {new Date(doc.updated_at).toLocaleString()})</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default DocumentList;