import { BaseBlock } from './base.js';

export class CodeBlock extends BaseBlock {
    static type = 'code';

    constructor(options = {}) {
        super(options);
        this.language = options.language || 'javascript';
        this.setupPrism();
    }

    createElement() {
        const element = super.createElement();
        element.innerHTML = `
            <div class="code-block">
                <div class="code-header">
                    <select class="language-select">
                        ${this.getSupportedLanguages().map(lang => 
                            `<option value="${lang}" ${lang === this.language ? 'selected' : ''}>
                                ${lang}
                            </option>`
                        ).join('')}
                    </select>
                    <button class="copy-button">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
                <pre><code contenteditable="true" class="language-${this.language}"></code></pre>
            </div>
        `;
        return element;
    }

    setupPrism() {
        if (!window.Prism) {
            console.warn('Prism.js is not loaded');
            return;
        }
    }

    getSupportedLanguages() {
        return [
            'javascript',
            'python',
            'java',
            'html',
            'css',
            'typescript',
            'sql',
            'json',
            'markdown'
        ];
    }

    render() {
        const codeElement = this.element.querySelector('code');
        codeElement.textContent = this.content;
        if (window.Prism) {
            Prism.highlightElement(codeElement);
        }
    }

    setupEventListeners() {
        super.setupEventListeners();

        const languageSelect = this.element.querySelector('.language-select');
        languageSelect.addEventListener('change', (e) => {
            this.language = e.target.value;
            const codeElement = this.element.querySelector('code');
            codeElement.className = `language-${this.language}`;
            this.render();
        });

        const copyButton = this.element.querySelector('.copy-button');
        copyButton.addEventListener('click', () => this.copyToClipboard());

        const codeElement = this.element.querySelector('code');
        codeElement.addEventListener('input', () => {
            if (window.Prism) {
                Prism.highlightElement(codeElement);
            }
        });
    }

    async copyToClipboard() {
        const code = this.getContent();
        try {
            await navigator.clipboard.writeText(code);
            this.showCopyFeedback(true);
        } catch (err) {
            this.showCopyFeedback(false);
        }
    }

    showCopyFeedback(success) {
        const copyButton = this.element.querySelector('.copy-button');
        const originalHTML = copyButton.innerHTML;
        copyButton.innerHTML = success ? 
            '<span class="text-green-500">✓</span>' : 
            '<span class="text-red-500">✗</span>';
        setTimeout(() => {
            copyButton.innerHTML = originalHTML;
        }, 2000);
    }

    getContent() {
        return this.element.querySelector('code').textContent;
    }

    serialize() {
        return {
            ...super.serialize(),
            language: this.language
        };
    }
}