export class BaseBlock {
    constructor(options = {}) {
        this.id = options.id || crypto.randomUUID();
        this.content = options.content || '';
        this.element = this.createElement();
        this.isSelected = false;
        
        this.setupEventListeners();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'block';
        element.dataset.blockId = this.id;
        return element;
    }

    setupEventListeners() {
        this.element.addEventListener('click', () => {
            this.emit('block:select', { blockId: this.id });
        });

        this.element.addEventListener('input', () => {
            this.emit('block:change', {
                blockId: this.id,
                content: this.getContent(),
                type: this.constructor.type
            });
        });
    }

    select() {
        this.isSelected = true;
        this.element.classList.add('block-selected');
    }

    deselect() {
        this.isSelected = false;
        this.element.classList.remove('block-selected');
    }

    getContent() {
        return this.content;
    }

    setContent(content) {
        this.content = content;
        this.render();
    }

    render() {
        // To be implemented by subclasses
        throw new Error('render() must be implemented by subclass');
    }

    serialize() {
        return {
            id: this.id,
            type: this.constructor.type,
            content: this.getContent()
        };
    }

    emit(eventName, detail) {
        this.element.dispatchEvent(
            new CustomEvent(eventName, {
                bubbles: true,
                detail
            })
        );
    }

    destroy() {
        this.element.remove();
    }
}