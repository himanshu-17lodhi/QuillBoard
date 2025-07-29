import { BaseBlock } from './base.js';

export class HeadingBlock extends BaseBlock {
    static type = 'heading';

    constructor(options = {}) {
        super(options);
        this.level = options.level || 1;
    }

    createElement() {
        const element = super.createElement();
        element.innerHTML = `
            <div class="heading-block" contenteditable="true"></div>
            <div class="block-handle">
                <button class="heading-level-toggle">H${this.level}</button>
            </div>
        `;
        return element;
    }

    render() {
        const headingElement = this.element.querySelector('.heading-block');
        headingElement.textContent = this.content;
        headingElement.style.fontSize = this.getLevelSize();
    }

    getLevelSize() {
        const sizes = {
            1: '2rem',
            2: '1.5rem',
            3: '1.25rem'
        };
        return sizes[this.level] || '1rem';
    }

    cycleHeadingLevel() {
        this.level = (this.level % 3) + 1;
        const toggle = this.element.querySelector('.heading-level-toggle');
        toggle.textContent = `H${this.level}`;
        this.render();
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        const toggle = this.element.querySelector('.heading-level-toggle');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.cycleHeadingLevel();
        });
    }

    serialize() {
        return {
            ...super.serialize(),
            level: this.level
        };
    }
}