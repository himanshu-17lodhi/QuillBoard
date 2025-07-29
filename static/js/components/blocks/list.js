import { BaseBlock } from './base.js';

export class ListBlock extends BaseBlock {
    static type = 'list';

    constructor(options = {}) {
        super(options);
        this.listType = options.listType || 'bullet';
        this.items = options.items || [''];
    }

    createElement() {
        const element = super.createElement();
        element.innerHTML = `
            <div class="list-block">
                ${this.listType === 'bullet' ? '<ul></ul>' : '<ol></ol>'}
                <div class="block-handle">
                    <button class="list-type-toggle">
                        ${this.listType === 'bullet' ? '•' : '1.'}
                    </button>
                </div>
            </div>
        `;
        return element;
    }

    render() {
        const listElement = this.element.querySelector('ul, ol');
        listElement.innerHTML = this.items
            .map(item => `
                <li contenteditable="true">${item}</li>
            `)
            .join('');
    }

    toggleListType() {
        this.listType = this.listType === 'bullet' ? 'number' : 'bullet';
        const newList = document.createElement(this.listType === 'bullet' ? 'ul' : 'ol');
        const oldList = this.element.querySelector('ul, ol');
        const items = Array.from(oldList.children).map(li => li.textContent);
        oldList.replaceWith(newList);
        this.items = items;
        this.render();
    }

    setupEventListeners() {
        super.setupEventListeners();

        const toggle = this.element.querySelector('.list-type-toggle');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleListType();
        });

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.addListItem(e.target);
            } else if (e.key === 'Backspace' && this.isItemEmpty(e.target)) {
                e.preventDefault();
                this.removeListItem(e.target);
            }
        });
    }

    addListItem(currentItem) {
        const newItem = document.createElement('li');
        newItem.contentEditable = true;
        currentItem.after(newItem);
        newItem.focus();
    }

    removeListItem(item) {
        if (this.items.length > 1) {
            const prev = item.previousElementSibling;
            item.remove();
            if (prev) prev.focus();
        }
    }

    isItemEmpty(item) {
        return item.textContent.trim() === '';
    }

    getContent() {
        return Array.from(this.element.querySelectorAll('li'))
            .map(li => li.textContent);
    }

    serialize() {
        return {
            ...super.serialize(),
            listType: this.listType,
            items: this.getContent()
        };
    }
}