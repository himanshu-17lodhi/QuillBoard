/**
 * QuillBoard Keyboard Shortcuts Module
 * Handles global keyboard shortcuts for improved productivity
 */

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }
    
    init() {
        this.registerDefaultShortcuts();
        this.setupEventListeners();
        this.createHelpModal();
    }
    
    registerDefaultShortcuts() {
        // Global shortcuts
        this.register('ctrl+k,cmd+k', () => {
            const searchInput = document.querySelector('#global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, 'Search');
        
        this.register('ctrl+shift+h,cmd+shift+h', () => {
            this.showHelp();
        }, 'Show keyboard shortcuts');
        
        this.register('ctrl+shift+d,cmd+shift+d', () => {
            window.location.href = '/dashboard/';
        }, 'Go to dashboard');
        
        this.register('ctrl+shift+w,cmd+shift+w', () => {
            window.location.href = '/workspaces/';
        }, 'Go to workspaces');
        
        // Page editing shortcuts (only active on page edit pages)
        if (this.isPageEditPage()) {
            this.register('ctrl+s,cmd+s', (e) => {
                e.preventDefault();
                this.saveCurrentPage();
            }, 'Save page');
            
            this.register('ctrl+shift+p,cmd+shift+p', (e) => {
                e.preventDefault();
                this.togglePagePublish();
            }, 'Toggle page publish');
            
            this.register('ctrl+shift+c,cmd+shift+c', (e) => {
                e.preventDefault();
                this.copyPageLink();
            }, 'Copy page link');
            
            this.register('ctrl+shift+n,cmd+shift+n', (e) => {
                e.preventDefault();
                this.createNewPage();
            }, 'Create new page');
        }
        
        // Block editor shortcuts (only when editing blocks)
        if (this.hasBlockEditor()) {
            this.register('ctrl+enter,cmd+enter', (e) => {
                if (this.isInBlockEditor(e.target)) {
                    e.preventDefault();
                    this.addNewBlock();
                }
            }, 'Add new block (in editor)');
            
            this.register('ctrl+shift+enter,cmd+shift+enter', (e) => {
                if (this.isInBlockEditor(e.target)) {
                    e.preventDefault();
                    this.addNewBlockAbove();
                }
            }, 'Add new block above (in editor)');
            
            this.register('ctrl+d,cmd+d', (e) => {
                if (this.isInBlockEditor(e.target)) {
                    e.preventDefault();
                    this.duplicateCurrentBlock(e.target);
                }
            }, 'Duplicate current block (in editor)');
            
            this.register('ctrl+shift+backspace,cmd+shift+backspace', (e) => {
                if (this.isInBlockEditor(e.target)) {
                    e.preventDefault();
                    this.deleteCurrentBlock(e.target);
                }
            }, 'Delete current block (in editor)');
        }
        
        // Text formatting shortcuts
        this.register('ctrl+b,cmd+b', (e) => {
            if (this.isEditableElement(e.target)) {
                e.preventDefault();
                this.toggleBold();
            }
        }, 'Bold text (in editor)');
        
        this.register('ctrl+i,cmd+i', (e) => {
            if (this.isEditableElement(e.target)) {
                e.preventDefault();
                this.toggleItalic();
            }
        }, 'Italic text (in editor)');
        
        this.register('ctrl+u,cmd+u', (e) => {
            if (this.isEditableElement(e.target)) {
                e.preventDefault();
                this.toggleUnderline();
            }
        }, 'Underline text (in editor)');
        
        // Navigation shortcuts
        this.register('g d', () => {
            window.location.href = '/dashboard/';
        }, 'Go to dashboard (vim-style)');
        
        this.register('g w', () => {
            window.location.href = '/workspaces/';
        }, 'Go to workspaces (vim-style)');
        
        this.register('g h', () => {
            window.location.href = '/';
        }, 'Go to home (vim-style)');
    }
    
    register(keys, callback, description = '') {
        const keyArray = keys.split(',');
        keyArray.forEach(key => {
            this.shortcuts.set(key.trim(), { callback, description });
        });
    }
    
    setupEventListeners() {
        let keySequence = '';
        let sequenceTimer = null;
        
        document.addEventListener('keydown', (e) => {
            // Build key combination string
            const modifiers = [];
            if (e.ctrlKey) modifiers.push('ctrl');
            if (e.metaKey) modifiers.push('cmd');
            if (e.shiftKey) modifiers.push('shift');
            if (e.altKey) modifiers.push('alt');
            
            const key = e.key.toLowerCase();
            const combination = [...modifiers, key].join('+');
            
            // Check for direct key combination matches
            if (this.shortcuts.has(combination)) {
                const shortcut = this.shortcuts.get(combination);
                shortcut.callback(e);
                return;
            }
            
            // Handle key sequences (like vim-style)
            if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                keySequence += key;
                
                // Clear sequence timer
                if (sequenceTimer) {
                    clearTimeout(sequenceTimer);
                }
                
                // Set new timer to clear sequence
                sequenceTimer = setTimeout(() => {
                    keySequence = '';
                }, 1000);
                
                // Check for sequence matches
                if (this.shortcuts.has(keySequence)) {
                    const shortcut = this.shortcuts.get(keySequence);
                    shortcut.callback(e);
                    keySequence = '';
                    clearTimeout(sequenceTimer);
                }
            } else {
                // Clear sequence on modifier keys
                keySequence = '';
                if (sequenceTimer) {
                    clearTimeout(sequenceTimer);
                }
            }
        });
    }
    
    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'keyboard-shortcuts-modal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Keyboard Shortcuts</h3>
                        <button onclick="window.keyboardShortcuts.hideHelp()" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="shortcuts-list" class="space-y-2">
                        ${this.generateShortcutsList()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on escape
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideHelp();
            }
        });
    }
    
    generateShortcutsList() {
        const groups = {
            'Global': [],
            'Navigation': [],
            'Page Editing': [],
            'Block Editor': [],
            'Text Formatting': []
        };
        
        this.shortcuts.forEach((shortcut, key) => {
            if (!shortcut.description) return;
            
            let group = 'Global';
            if (key.includes('g ')) group = 'Navigation';
            else if (shortcut.description.includes('page') || shortcut.description.includes('Page')) group = 'Page Editing';
            else if (shortcut.description.includes('block') || shortcut.description.includes('Block')) group = 'Block Editor';
            else if (shortcut.description.includes('text') || shortcut.description.includes('Bold') || shortcut.description.includes('Italic')) group = 'Text Formatting';
            
            groups[group].push({ key, description: shortcut.description });
        });
        
        let html = '';
        Object.entries(groups).forEach(([groupName, shortcuts]) => {
            if (shortcuts.length === 0) return;
            
            html += `<div class="mb-4">`;
            html += `<h4 class="font-medium text-gray-900 mb-2">${groupName}</h4>`;
            html += `<div class="space-y-1">`;
            
            shortcuts.forEach(({ key, description }) => {
                const formattedKey = this.formatKeyForDisplay(key);
                html += `
                    <div class="flex justify-between items-center py-1">
                        <span class="text-gray-700">${description}</span>
                        <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">${formattedKey}</kbd>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        return html;
    }
    
    formatKeyForDisplay(key) {
        return key
            .replace(/ctrl/g, 'Ctrl')
            .replace(/cmd/g, '⌘')
            .replace(/shift/g, 'Shift')
            .replace(/alt/g, 'Alt')
            .replace(/\+/g, ' + ')
            .replace(/enter/g, 'Enter')
            .replace(/backspace/g, 'Backspace')
            .replace(/space/g, 'Space');
    }
    
    showHelp() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    hideHelp() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // Helper methods
    isPageEditPage() {
        return window.location.pathname.includes('/pages/') && 
               !window.location.pathname.endsWith('/list');
    }
    
    hasBlockEditor() {
        return document.querySelector('#blocks-container') !== null;
    }
    
    isInBlockEditor(element) {
        return element && element.closest('#blocks-container') !== null;
    }
    
    isEditableElement(element) {
        return element && (
            element.contentEditable === 'true' ||
            element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA'
        );
    }
    
    // Page-specific actions
    saveCurrentPage() {
        // Trigger save if there's a save function available
        if (window.savePageContent) {
            window.savePageContent();
        } else {
            this.showNotification('Auto-save is active', 'info');
        }
    }
    
    togglePagePublish() {
        const publishButton = document.querySelector('[onclick*="togglePublish"]');
        if (publishButton) {
            publishButton.click();
        }
    }
    
    copyPageLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Page link copied to clipboard', 'success');
        });
    }
    
    createNewPage() {
        const newPageButton = document.querySelector('[onclick*="createPage"]');
        if (newPageButton) {
            newPageButton.click();
        }
    }
    
    // Block editor actions
    addNewBlock() {
        const addBlockButton = document.querySelector('#add-block-area');
        if (addBlockButton) {
            addBlockButton.click();
        }
    }
    
    addNewBlockAbove() {
        // Implementation would depend on the current block editor setup
        this.showNotification('Add block above not implemented', 'info');
    }
    
    duplicateCurrentBlock(element) {
        const blockElement = element.closest('.notion-block');
        if (blockElement && window.blockEditor) {
            // Implementation would use block editor's duplicate function
            this.showNotification('Block duplication not fully implemented', 'info');
        }
    }
    
    deleteCurrentBlock(element) {
        const blockElement = element.closest('.notion-block');
        if (blockElement) {
            if (confirm('Delete this block?')) {
                // Implementation would delete the block
                this.showNotification('Block deletion not fully implemented', 'info');
            }
        }
    }
    
    // Text formatting actions
    toggleBold() {
        document.execCommand('bold');
    }
    
    toggleItalic() {
        document.execCommand('italic');
    }
    
    toggleUnderline() {
        document.execCommand('underline');
    }
    
    // Utility methods
    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize keyboard shortcuts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcuts = new KeyboardShortcuts();
});

// Export for use in templates
window.KeyboardShortcuts = KeyboardShortcuts;