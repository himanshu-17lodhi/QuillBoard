import { ApiClient } from '../utils/api.js';

export class AIAssistant {
    constructor(options = {}) {
        this.api = new ApiClient();
        this.container = options.container;
        this.editor = options.editor;
        this.setupUI();
        this.setupEventListeners();
    }

    setupUI() {
        this.container.innerHTML = `
            <div class="ai-assistant-panel">
                <div class="ai-assistant-header">
                    <h3>AI Assistant</h3>
                    <button class="ai-toggle-btn">
                        <span class="toggle-icon"></span>
                    </button>
                </div>
                <div class="ai-assistant-content">
                    <div class="suggestion-list"></div>
                    <div class="command-input">
                        <input type="text" 
                               placeholder="Ask AI assistant..." 
                               class="ai-input">
                        <button class="ai-submit-btn">Send</button>
                    </div>
                </div>
            </div>
        `;

        this.input = this.container.querySelector('.ai-input');
        this.suggestionList = this.container.querySelector('.suggestion-list');
    }

    setupEventListeners() {
        this.container.querySelector('.ai-toggle-btn')
            .addEventListener('click', () => this.togglePanel());

        this.container.querySelector('.ai-submit-btn')
            .addEventListener('click', () => this.processCommand());

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processCommand();
            }
        });

        // Context menu for block-specific AI actions
        document.addEventListener('contextmenu', (e) => {
            const block = e.target.closest('.block');
            if (block) {
                e.preventDefault();
                this.showContextMenu(e, block);
            }
        });
    }

    async processCommand() {
        const command = this.input.value.trim();
        if (!command) return;

        this.showLoading();
        try {
            const response = await this.api.post('/api/ai/process/', {
                command,
                context: this.getEditorContext()
            });

            this.handleAIResponse(response);
        } catch (error) {
            this.showError('Failed to process command');
        } finally {
            this.hideLoading();
            this.input.value = '';
        }
    }

    getEditorContext() {
        if (!this.editor) return {};

        const selectedBlock = Array.from(this.editor.blocks.values())
            .find(block => block.isSelected);

        return {
            selectedBlock: selectedBlock ? {
                id: selectedBlock.id,
                type: selectedBlock.constructor.type,
                content: selectedBlock.getContent()
            } : null,
            blocks: this.editor.serialize()
        };
    }

    handleAIResponse(response) {
        if (response.suggestions) {
            this.showSuggestions(response.suggestions);
        }

        if (response.actions) {
            this.executeActions(response.actions);
        }

        if (response.message) {
            this.showMessage(response.message);
        }
    }

    showSuggestions(suggestions) {
        this.suggestionList.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-content">${suggestion.content}</div>
                <div class="suggestion-actions">
                    <button class="apply-btn" data-suggestion-id="${suggestion.id}">
                        Apply
                    </button>
                    <button class="dismiss-btn" data-suggestion-id="${suggestion.id}">
                        Dismiss
                    </button>
                </div>
            </div>
        `).join('');

        this.suggestionList.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => 
                this.applySuggestion(btn.dataset.suggestionId)
            );
        });
    }

    async applySuggestion(suggestionId) {
        try {
            const response = await this.api.post(`/api/ai/suggestions/${suggestionId}/apply/`);
            if (response.changes) {
                this.applyChanges(response.changes);
            }
        } catch (error) {
            this.showError('Failed to apply suggestion');
        }
    }

    applyChanges(changes) {
        changes.forEach(change => {
            const block = this.editor.blocks.get(change.blockId);
            if (block) {
                block.setContent(change.content);
            }
        });
    }

    showContextMenu(event, block) {
        const menu = document.createElement('div');
        menu.className = 'ai-context-menu';
        menu.innerHTML = `
            <div class="menu-item" data-action="improve">Improve writing</div>
            <div class="menu-item" data-action="expand">Expand content</div>
            <div class="menu-item" data-action="summarize">Summarize</div>
        `;

        menu.style.position = 'absolute';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;

        document.body.appendChild(menu);

        menu.addEventListener('click', async (e) => {
            const action = e.target.dataset.action;
            if (action) {
                await this.handleContextAction(action, block);
            }
            menu.remove();
        });

        document.addEventListener('click', () => menu.remove(), { once: true });
    }

    async handleContextAction(action, block) {
        try {
            const response = await this.api.post('/api/ai/block-action/', {
                action,
                blockId: block.dataset.blockId
            });
            
            if (response.suggestion) {
                this.showSuggestions([response.suggestion]);
            }
        } catch (error) {
            this.showError('Failed to process action');
        }
    }

    showLoading() {
        this.container.classList.add('loading');
    }

    hideLoading() {
        this.container.classList.remove('loading');
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'ai-error';
        error.textContent = message;
        this.suggestionList.appendChild(error);
        setTimeout(() => error.remove(), 3000);
    }

    showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message';
        messageEl.textContent = message;
        this.suggestionList.appendChild(messageEl);
    }

    togglePanel() {
        this.container.classList.toggle('collapsed');
    }
}