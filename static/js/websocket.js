document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const documentId = editor.dataset.documentId;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/document/${documentId}/`);
    
    window.socket = socket;

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.content && data.content.blocks) {
            renderBlocks(data.content.blocks);
        }
    };

    socket.onclose = function(e) {
        console.error('WebSocket closed unexpectedly');
    };

    function renderBlocks(blocks) {
        const editor = document.getElementById('editor');
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
            input.dataset.type = block.type;
            blockElement.appendChild(input);
            editor.appendChild(blockElement);
        });
    }
});