import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import io from 'socket.io-client';

function Editor() {
  const { documentId } = useParams();
  const [blocks, setBlocks] = useState([]);
  const [status, setStatus] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch initial document content
    axios.get(`/api/documents/${documentId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(response => setBlocks(response.data.content.blocks || []))
      .catch(error => console.error('Error loading document:', error));

    // Initialize WebSocket
    socketRef.current = io(window.location.origin, {
      path: `/ws/document/${documentId}/`
    });

    socketRef.current.on('connect', () => setStatus('Connected'));
    socketRef.current.on('document_update', (data) => {
      if (data.content && data.content.blocks) {
        setBlocks(data.content.blocks);
        setStatus(`Updated by ${data.user}`);
      }
    });
    socketRef.current.on('disconnect', () => {
      setStatus('Disconnected. Reconnecting...');
      setTimeout(() => socketRef.current.connect(), 3000);
    });

    return () => socketRef.current.disconnect();
  }, [documentId]);

  const addBlock = (type) => {
    const newBlock = { id: `block-${Date.now()}`, type, content: '' };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    sendUpdate(updatedBlocks);
  };

  const updateBlock = (index, content) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index].content = content;
    setBlocks(updatedBlocks);
    sendUpdate(updatedBlocks);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    axios.post(`/api/documents/upload/`, formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(response => {
        const updatedBlocks = [...blocks, {
          id: `block-${Date.now()}`,
          type: 'file',
          content: response.data.url,
          filename: file.name
        }];
        setBlocks(updatedBlocks);
        sendUpdate(updatedBlocks);
      })
      .catch(error => console.error('Error uploading file:', error));
  };

  const fetchAISuggestions = () => {
    console.log('Requesting AI suggestions for:', blocks[0]?.content);
    console.log('Sample API call: POST https://x.ai/api with { text: "current content" }');
    alert('AI suggestions placeholder. Visit https://x.ai/api for integration.');
  };

  const sendUpdate = (blocks) => {
    socketRef.current.emit('document_update', { content: { blocks } });
    axios.post(`/api/documents/${documentId}/update_content/`, { content: { blocks } }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    }).catch(error => console.error('Error saving document:', error));
  };

  return (
    <div>
      <h1>Editor</h1>
      <ButtonGroup className="mb-3">
        <Button variant="secondary" onClick={() => addBlock('text')}>Text</Button>
        <Button variant="secondary" onClick={() => addBlock('heading')}>Heading</Button>
        <Button variant="secondary" onClick={() => addBlock('list')}>List</Button>
        <Button variant="primary" onClick={fetchAISuggestions}>AI Suggestions</Button>
      </ButtonGroup>
      <Form.Group className="mb-3">
        <Form.Control type="file" onChange={handleFileUpload} accept=".pdf,image/*" />
      </Form.Group>
      <div>
        {blocks.map((block, index) => (
          <div key={block.id} className="editor-block">
            {block.type === 'heading' ? (
              <Form.Control
                type="text"
                className="h3"
                value={block.content}
                onChange={(e) => updateBlock(index, e.target.value)}
              />
            ) : block.type === 'list' ? (
              <Form.Control
                as="textarea"
                placeholder="Enter list items, one per line"
                value={block.content}
                onChange={(e) => updateBlock(index, e.target.value)}
              />
            ) : block.type === 'file' ? (
              <div>
                <a href={block.content} target="_blank" rel="noopener noreferrer">
                  File: {block.filename}
                </a>
              </div>
            ) : (
              <Form.Control
                as="textarea"
                value={block.content}
                onChange={(e) => updateBlock(index, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {status && <Alert variant="info" style={{ position: 'fixed', bottom: 10, right: 10 }}>{status}</Alert>}
    </div>
  );
}

export default Editor;