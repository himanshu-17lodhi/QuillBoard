/**
 * QuillBoard Block Editor Module
 * Handles block-based editing functionality similar to Notion
 */

class BlockEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            canEdit: true,
            websocket: null,
            pageId: null,
            csrfToken: null,
            ...options
        };
        this.blocks = new Map();
        this.activeBlock = null;
        this.slashCommandActive = false;
        
        this.init();
    }
    
    init() {
        this.setupSortable();
        this.setupEventListeners();
        this.loadExistingBlocks();
    }
    
    setupSortable() {
        if (!this.options.canEdit) return;
        
        new Sortable(this.container, {
            handle: '.block-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            animation: 150,
            onEnd: (evt) => {
                const blockId = evt.item.dataset.blockId;
                const newOrder = evt.newIndex;
                this.updateBlockOrder(blockId, newOrder);
            }
        });
    }
    
    setupEventListeners() {
        // Block content changes
        this.container.addEventListener('input', this.debounce((e) => {
            if (e.target.contentEditable === 'true') {
                this.handleBlockContentChange(e);
            }
        }, 300));
        
        // Slash commands
        this.container.addEventListener('keydown', (e) => {
            if (e.target.contentEditable === 'true') {
                this.handleKeyDown(e);
            }
        });
        
        // Block selection
        this.container.addEventListener('click', (e) => {
            const blockElement = e.target.closest('.notion-block');
            if (blockElement) {
                this.setActiveBlock(blockElement);
            }
        });
        
        // Paste handling
        this.container.addEventListener('paste', (e) => {
            if (e.target.contentEditable === 'true') {
                this.handlePaste(e);
            }
        });
    }
    
    handleKeyDown(e) {
        const blockElement = e.target.closest('.notion-block');
        if (!blockElement) return;
        
        // Slash commands
        if (e.key === '/' && e.target.textContent.length === 0) {
            e.preventDefault();
            this.showSlashCommands(blockElement);
            return;
        }
        
        // Enter key - create new block
        if (e.key === 'Enter' && !e.shiftKey) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            
            // If cursor is at the end, create new block
            if (range.endOffset === e.target.textContent.length) {
                e.preventDefault();
                this.createNewBlockAfter(blockElement);
                return;
            }
        }
        
        // Backspace at beginning - merge with previous block
        if (e.key === 'Backspace' && e.target.textContent.length === 0) {
            e.preventDefault();
            this.mergeWithPreviousBlock(blockElement);
            return;
        }
        
        // Arrow keys for block navigation
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            
            if ((e.key === 'ArrowUp' && range.startOffset === 0) ||
                (e.key === 'ArrowDown' && range.endOffset === e.target.textContent.length)) {
                e.preventDefault();
                this.navigateToAdjacentBlock(blockElement, e.key === 'ArrowUp' ? 'up' : 'down');
            }
        }
    }
    
    showSlashCommands(blockElement) {
        this.slashCommandActive = true;
        
        // Create slash command menu
        const menu = document.createElement('div');
        menu.className = 'slash-command-menu absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-64';
        menu.innerHTML = this.getSlashCommandsHTML();
        
        // Position menu below the block
        const rect = blockElement.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY}px`;
        menu.style.left = `${rect.left}px`;
        
        document.body.appendChild(menu);
        
        // Handle command selection
        menu.addEventListener('click', (e) => {
            const commandButton = e.target.closest('[data-command]');
            if (commandButton) {
                const command = commandButton.dataset.command;
                this.executeSlashCommand(blockElement, command);
                this.removeSlashCommandMenu();
            }
        });
        
        // Close menu on escape or click outside
        const closeMenu = (e) => {
            if (e.key === 'Escape' || !menu.contains(e.target)) {
                this.removeSlashCommandMenu();
                document.removeEventListener('keydown', closeMenu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        document.addEventListener('keydown', closeMenu);
        document.addEventListener('click', closeMenu);
    }
    
    getSlashCommandsHTML() {
        const commands = [
            { id: 'text', icon: 'fas fa-font', name: 'Text', description: 'Just start writing with plain text.' },
            { id: 'heading', icon: 'fas fa-heading', name: 'Heading 1', description: 'Big section heading.' },
            { id: 'heading2', icon: 'fas fa-heading', name: 'Heading 2', description: 'Medium section heading.' },
            { id: 'heading3', icon: 'fas fa-heading', name: 'Heading 3', description: 'Small section heading.' },
            { id: 'bullet_list', icon: 'fas fa-list-ul', name: 'Bulleted list', description: 'Create a simple bulleted list.' },
            { id: 'numbered_list', icon: 'fas fa-list-ol', name: 'Numbered list', description: 'Create a list with numbering.' },
            { id: 'todo', icon: 'fas fa-check-square', name: 'To-do list', description: 'Track tasks with a to-do list.' },
            { id: 'quote', icon: 'fas fa-quote-left', name: 'Quote', description: 'Capture a quote.' },
            { id: 'divider', icon: 'fas fa-minus', name: 'Divider', description: 'Visually divide blocks.' },
            { id: 'callout', icon: 'fas fa-exclamation-triangle', name: 'Callout', description: 'Make writing stand out.' }
        ];
        
        return commands.map(cmd => `
            <button data-command="${cmd.id}" class="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center">
                <i class="${cmd.icon} mr-3 text-gray-400 w-4"></i>
                <div>
                    <div class="font-medium text-gray-900">${cmd.name}</div>
                    <div class="text-sm text-gray-500">${cmd.description}</div>
                </div>
            </button>
        `).join('');
    }
    
    executeSlashCommand(blockElement, command) {
        const blockType = command === 'heading2' ? 'heading' : command === 'heading3' ? 'heading' : command;
        const level = command === 'heading2' ? 2 : command === 'heading3' ? 3 : 1;
        
        // Update existing block or create new one
        const blockId = blockElement.dataset.blockId;
        if (blockId && blockId !== 'add-block-area') {
            this.convertBlock(blockElement, blockType, level);
        } else {
            this.createBlock(blockType, '', { level });
        }
    }
    
    convertBlock(blockElement, newType, level = 1) {
        const blockId = blockElement.dataset.blockId;
        const currentText = blockElement.querySelector('[contenteditable="true"]')?.textContent || '';
        
        // Update block type via API
        fetch(`/api/blocks/${blockId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.options.csrfToken
            },
            body: JSON.stringify({
                block_type: newType,
                content: this.getContentForType(newType, currentText, level)
            })
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(data => {
            if (data) {
                this.updateBlockInDOM(blockElement, data);
            }
        });
    }
    
    getContentForType(blockType, text = '', level = 1) {
        switch (blockType) {
            case 'heading':
                return { text, level };
            case 'todo':
                return { text, checked: false };
            case 'callout':
                return { text, icon: '💡' };
            case 'quote':
                return { text };
            case 'divider':
                return {};
            default:
                return { text };
        }
    }
    
    createNewBlockAfter(blockElement) {
        const newBlockElement = this.createEmptyBlock();
        
        // Insert after current block
        if (blockElement.nextSibling) {
            this.container.insertBefore(newBlockElement, blockElement.nextSibling);
        } else {
            this.container.appendChild(newBlockElement);
        }
        
        // Focus on new block
        const editableElement = newBlockElement.querySelector('[contenteditable="true"]');
        if (editableElement) {
            editableElement.focus();
        }
    }
    
    createEmptyBlock(type = 'text') {
        const blockElement = document.createElement('div');
        blockElement.className = 'notion-block';
        blockElement.dataset.blockType = type;
        blockElement.innerHTML = this.getBlockHTML(type, '');
        
        return blockElement;
    }
    
    getBlockHTML(type, content = '', options = {}) {
        const handleHTML = this.options.canEdit ? 
            '<div class="block-handle opacity-0 mr-2 cursor-grab"><i class="fas fa-grip-vertical text-gray-400"></i></div>' : '';
        
        switch (type) {
            case 'heading':
                const level = options.level || 1;
                const headingClass = level === 1 ? 'text-2xl font-bold' : level === 2 ? 'text-xl font-semibold' : 'text-lg font-medium';
                return `
                    <div class="flex items-start">
                        ${handleHTML}
                        <div class="flex-1">
                            <h${level} contenteditable="${this.options.canEdit}" 
                                   class="${headingClass} outline-none text-gray-900" 
                                   data-placeholder="Heading ${level}">${content}</h${level}>
                        </div>
                    </div>
                `;
            case 'todo':
                return `
                    <div class="flex items-start">
                        ${handleHTML}
                        <div class="flex items-center flex-1">
                            <input type="checkbox" class="mr-2 mt-1" ${options.checked ? 'checked' : ''}>
                            <div contenteditable="${this.options.canEdit}" 
                                 class="flex-1 outline-none" 
                                 data-placeholder="To-do">${content}</div>
                        </div>
                    </div>
                `;
            case 'bullet_list':
                return `
                    <div class="flex items-start">
                        ${handleHTML}
                        <div class="flex items-start flex-1">
                            <span class="mr-2 mt-1">•</span>
                            <div contenteditable="${this.options.canEdit}" 
                                 class="flex-1 outline-none" 
                                 data-placeholder="List item">${content}</div>
                        </div>
                    </div>
                `;
            case 'quote':
                return `
                    <div class="flex items-start">
                        ${handleHTML}
                        <div class="flex-1 border-l-4 border-gray-300 pl-4">
                            <div contenteditable="${this.options.canEdit}" 
                                 class="outline-none italic text-gray-700" 
                                 data-placeholder="Quote">${content}</div>
                        </div>
                    </div>
                `;
            case 'callout':
                return `
                    <div class="flex items-start">
                        ${handleHTML}
                        <div class="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-start">
                                <span class="mr-2 text-lg">${options.icon || '💡'}</span>
                                <div contenteditable="${this.options.canEdit}" 
                                     class="flex-1 outline-none" 
                                     data-placeholder="Write a callout...">${content}</div>
                            </div>
                        </div>
                    </div>
                `;
            case 'divider':
                return `
                    <div class="flex items-center">
                        ${handleHTML}
                        <div class="flex-1 border-t border-gray-300"></div>
                    </div>
                `;
            default: // text
                return `
                    <div class="flex items-start">
                        ${handleHTML}
                        <div class="flex-1">
                            <div contenteditable="${this.options.canEdit}" 
                                 class="outline-none" 
                                 data-placeholder="Type '/' for commands">${content}</div>
                        </div>
                    </div>
                `;
        }
    }
    
    removeSlashCommandMenu() {
        const menu = document.querySelector('.slash-command-menu');
        if (menu) {
            menu.remove();
        }
        this.slashCommandActive = false;
    }
    
    handleBlockContentChange(e) {
        const blockElement = e.target.closest('.notion-block');
        if (!blockElement) return;
        
        const blockId = blockElement.dataset.blockId;
        const blockType = blockElement.dataset.blockType;
        
        if (!blockId || blockId === 'add-block-area') return;
        
        let content = {};
        
        if (blockType === 'todo') {
            const checkbox = blockElement.querySelector('input[type="checkbox"]');
            content = {
                text: e.target.textContent,
                checked: checkbox ? checkbox.checked : false
            };
        } else if (blockType === 'heading') {
            const level = parseInt(e.target.tagName?.charAt(1)) || 1;
            content = {
                text: e.target.textContent,
                level: level
            };
        } else {
            content = {
                text: e.target.textContent
            };
        }
        
        // Send update via WebSocket for real-time collaboration
        if (this.options.websocket) {
            this.options.websocket.send({
                type: 'block_update',
                block_id: blockId,
                content: content,
                timestamp: Date.now()
            });
        }
        
        // Also save to API
        this.saveBlockContent(blockId, content);
    }
    
    saveBlockContent(blockId, content) {
        fetch(`/api/blocks/${blockId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.options.csrfToken
            },
            body: JSON.stringify({ content })
        });
    }
    
    createBlock(blockType, content = '', options = {}) {
        const order = this.container.querySelectorAll('.notion-block').length;
        
        return fetch(`/api/pages/${this.options.pageId}/blocks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.options.csrfToken
            },
            body: JSON.stringify({
                block_type: blockType,
                content: this.getContentForType(blockType, content, options.level),
                order: order
            })
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(data => {
            if (data) {
                this.addBlockToDOM(data);
                return data;
            }
        });
    }
    
    addBlockToDOM(blockData) {
        const blockElement = document.createElement('div');
        blockElement.className = 'notion-block';
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = blockData.block_type;
        
        const content = blockData.content.text || '';
        blockElement.innerHTML = this.getBlockHTML(blockData.block_type, content, blockData.content);
        
        // Insert before add-block-area if it exists
        const addBlockArea = this.container.querySelector('#add-block-area');
        if (addBlockArea) {
            this.container.insertBefore(blockElement, addBlockArea);
        } else {
            this.container.appendChild(blockElement);
        }
        
        // Focus on the new block
        const editableElement = blockElement.querySelector('[contenteditable="true"]');
        if (editableElement) {
            editableElement.focus();
        }
        
        return blockElement;
    }
    
    updateBlockOrder(blockId, newOrder) {
        fetch(`/api/blocks/${blockId}/move/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.options.csrfToken
            },
            body: JSON.stringify({ order: newOrder })
        });
    }
    
    loadExistingBlocks() {
        // Register existing blocks
        this.container.querySelectorAll('.notion-block[data-block-id]').forEach(block => {
            const blockId = block.dataset.blockId;
            if (blockId && blockId !== 'add-block-area') {
                this.blocks.set(blockId, block);
            }
        });
    }
    
    setActiveBlock(blockElement) {
        // Remove active state from previous block
        if (this.activeBlock) {
            this.activeBlock.classList.remove('active-block');
        }
        
        // Set new active block
        this.activeBlock = blockElement;
        blockElement.classList.add('active-block');
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Export for use in templates
window.BlockEditor = BlockEditor;