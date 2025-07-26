document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const toolbar = document.getElementById('editor-toolbar');
    const documentId = editor.dataset.documentId;

    // Load initial content
    fetch(`/api/documents/${documentId}/`)
        .then(response => response.json())
        .then(data => renderBlocks(data.content.blocks || []));

    // Toolbar event listeners
    toolbar.querySelectorAll('.block-type').forEach(button => {
        button.addEventListener('click', () => addBlock(button.dataset.type));
    });

    // AI suggestion button
    document.getElementById('ai-suggest').addEventListener('click', fetchAISuggestions);

    function addBlock(type) {
        const block = { type, content: '' };
        const blocks = getBlocks();
        blocks.push(block);
        renderBlocks(blocks);
        sendUpdate({ blocks });
    }

    function renderBlocks(blocks) {
        editor.innerHTML = '';
        blocks.forEach((block, index) => {
            const blockElement = document.createElement('div');
            blockElement.className = 'editor-block';
            blockElement.dataset.index = index;
            let input;
            switch (block.type) {
                case 'heading':
                    input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control h3';
                    break;
                case 'list':
                    input = document.createElement('textarea');
                    input.className = 'form-control';
                    input.placeholder = 'Enter list items, one per line';
                    break;
                default:
                    input = document.createElement('textarea');
                    input.className = 'form-control';
            }
            input.value = block.content;
            input.addEventListener('input', () => updateBlock(index, input.value));
            blockElement.appendChild(input);
            editor.appendChild(blockElement);
        });
    }

    function updateBlock(index, content) {
        const blocks = getBlocks();
        blocks[index].content = content;
        sendUpdate({ blocks });
    }

    function getBlocks() {
        return Array.from(editor.querySelectorAll('.editor-block')).map(block => {
            return {
                type: block.querySelector('input, textarea').dataset.type || 'text',
                content: block.querySelector('input, textarea').value
            };
        });
    }

    function sendUpdate(content) {
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({ content }));
        }
        // Also send to API for persistence
        fetch(`/api/documents/${documentId}/update_content/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ content })
        });
    }

    function fetchAISuggestions() {
        // Placeholder for AI integration
        alert('AI suggestions coming soon! Visit https://x.ai/api for integration.');
        // Example: fetch('/api/ai-suggestions/', { method: 'POST', body: JSON.stringify({ text: getBlocks()[0].content }) })
    }

    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
});