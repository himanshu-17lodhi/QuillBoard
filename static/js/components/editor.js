import { BlockFactory } from './blocks/factory.js';
import { CollaborationManager } from './collaboration.js';
import { ApiClient } from '../utils/api.js';
import { debounce } from '../utils/helpers.js';

export class Editor {
    constructor(options = {}) {
        this.container = options.container;
        this.pageId = options.pageId;
        this.blockFactory = new BlockFactory();
        this.blocks = new Map();
        this.api = new ApiClient();
        
        if (options.enableCollaboration) {
            this.collaboration = new CollaborationManager({
                pageId: this.pageId,
                onPresenceUpdate: this.handlePresenceUpdate.bind(this),
                onBlockUpdate: this.handleRemoteBlockUpdate.bind(this)
            });
        }

        this.setupEventListeners();
        this.loadContent();
    }

    async loadContent() {
        try {
            const page = await this.api.get(`/api/pages/${this.pageId}/`);
            this.setTitle(page.title);
            
            const blocks = await this.api.get(`/api/pages/${this.pageId}/blocks/`);
            blocks.forEach(blockData => this.addBlock(blockData));
        } catch (error) {
            console.error('Failed to load page content:', error);
        }
    }

    setTitle(title) {
        const titleInput = document.getElementById('page-title');
        if (titleInput) {
            titleInput.value = title;
        }
    }

    addBlock(blockData, index = -1) {
        const block = this.blockFactory.createBlock(blockData.type, {
            id: blockData.id,
            content: blockData.content
        });

        this.blocks.set(block.id, block);
        
        if (index === -1) {
            this.container.appendChild(block.element);
        } else {
            const blocks = Array.from(this.container.children);
            const referenceNode = blocks[index] || null;
            this.container.insertBefore(block.element, referenceNode);
        }

        block.render();
        return block;
    }

    removeBlock(blockId) {
        const block = this.blocks.get(blockId);
        if (block) {
            block.destroy();
            this.blocks.delete(blockId);
        }
    }

    setupEventListeners() {
        this.container.addEventListener('block:select', this.handleBlockSelect.bind(this));
        this.container.addEventListener('block:change', debounce(this.handleBlockChange.bind(this), 500));
        
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        const titleInput = document.getElementById('page-title');
        if (titleInput) {
            titleInput.addEventListener('input', debounce(this.handleTitleChange.bind(this), 500));
        }
    }

    handleBlockSelect(event) {
        const { blockId } = event.detail;
        this.blocks.forEach(block => {
            if (block.id === blockId) {
                block.select();
            } else {
                block.deselect();
            }
        });
    }

    async handleBlockChange(event) {
        const { blockId, content, type } = event.detail;
        try {
            await this.api.patch(`/api/blocks/${blockId}/`, {
                content,
                type
            });

            if (this.collaboration) {
                this.collaboration.broadcastBlockUpdate(blockId, content);
            }
        } catch (error) {
            console.error('Failed to save block:', error);
        }
    }

    async handleTitleChange(event) {
        try {
            await this.api.patch(`/api/pages/${this.pageId}/`, {
                title: event.target.value
            });
        } catch (error) {
            console.error('Failed to update title:', error);
        }
    }

    handleKeydown(event) {
        if (event.key === 'Enter' && event.ctrlKey) {
            const selectedBlock = Array.from(this.blocks.values())
                .find(block => block.isSelected);
            
            if (selectedBlock) {
                const index = Array.from(this.container.children)
                    .indexOf(selectedBlock.element);
                this.addBlock({ type: 'text' }, index + 1);
            }
        }
    }

    handlePresenceUpdate(presenceData) {
        // Update UI to show active collaborators
        const presenceIndicators = document.getElementById('presence-indicators');
        if (presenceIndicators) {
            presenceIndicators.innerHTML = presenceData
                .map(user => `
                    <div class="presence-indicator" 
                         style="background-color: ${user.color}"
                         title="${user.email}">
                        ${user.email[0].toUpperCase()}
                    </div>
                `)
                .join('');
        }
    }

    handleRemoteBlockUpdate(blockId, content) {
        const block = this.blocks.get(blockId);
        if (block) {
            block.setContent(content);
        }
    }

    serialize() {
        return Array.from(this.blocks.values()).map(block => block.serialize());
    }
}