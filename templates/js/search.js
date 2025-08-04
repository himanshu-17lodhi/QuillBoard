/**
 * QuillBoard Search Module
 * Handles global search functionality with live filtering
 */

class QuillBoardSearch {
    constructor(options = {}) {
        this.options = {
            searchInputSelector: '#global-search',
            resultsContainerSelector: '#search-results',
            minQueryLength: 2,
            debounceDelay: 300,
            ...options
        };
        
        this.searchInput = null;
        this.resultsContainer = null;
        this.currentQuery = '';
        this.isSearching = false;
        this.searchController = null;
        
        this.init();
    }
    
    init() {
        this.createSearchUI();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }
    
    createSearchUI() {
        // Create search bar in header if it doesn't exist
        const nav = document.querySelector('nav .flex.items-center.space-x-4');
        if (nav && !document.querySelector('#global-search')) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'relative hidden md:block';
            searchContainer.innerHTML = `
                <div class="relative">
                    <input type="text" 
                           id="global-search" 
                           class="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                           placeholder="Search pages, workspaces... (Ctrl+K)">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                </div>
                <div id="search-results" class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg hidden z-50 max-h-96 overflow-y-auto"></div>
            `;
            
            // Insert before user menu
            const userMenu = nav.querySelector('.relative.group');
            if (userMenu) {
                nav.insertBefore(searchContainer, userMenu);
            } else {
                nav.appendChild(searchContainer);
            }
        }
        
        this.searchInput = document.querySelector(this.options.searchInputSelector);
        this.resultsContainer = document.querySelector(this.options.resultsContainerSelector);
    }
    
    setupEventListeners() {
        if (!this.searchInput) return;
        
        // Search input events
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearchInput(e.target.value);
        }, this.options.debounceDelay));
        
        this.searchInput.addEventListener('focus', () => {
            if (this.currentQuery) {
                this.showResults();
            }
        });
        
        this.searchInput.addEventListener('blur', () => {
            // Delay hiding to allow clicking on results
            setTimeout(() => {
                this.hideResults();
            }, 200);
        });
        
        // Keyboard navigation in results
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(e.key === 'ArrowDown' ? 'down' : 'up');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectResult();
            } else if (e.key === 'Escape') {
                this.hideResults();
                this.searchInput.blur();
            }
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.relative') || !e.target.closest('#global-search')) {
                this.hideResults();
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                    this.searchInput.select();
                }
            }
            
            // Escape to close search
            if (e.key === 'Escape' && document.activeElement === this.searchInput) {
                this.hideResults();
                this.searchInput.blur();
            }
        });
    }
    
    async handleSearchInput(query) {
        this.currentQuery = query.trim();
        
        if (this.currentQuery.length < this.options.minQueryLength) {
            this.hideResults();
            return;
        }
        
        // Cancel previous search
        if (this.searchController) {
            this.searchController.abort();
        }
        
        this.searchController = new AbortController();
        this.isSearching = true;
        
        try {
            this.showLoadingState();
            const results = await this.performSearch(this.currentQuery);
            this.displayResults(results);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
                this.showErrorState();
            }
        } finally {
            this.isSearching = false;
        }
    }
    
    async performSearch(query) {
        const response = await fetch(`/api/search/?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: this.searchController.signal
        });
        
        if (!response.ok) {
            throw new Error('Search request failed');
        }
        
        return await response.json();
    }
    
    displayResults(results) {
        if (!this.resultsContainer) return;
        
        if (!results || (results.pages?.length === 0 && results.workspaces?.length === 0)) {
            this.showNoResults();
            return;
        }
        
        let html = '';
        
        // Workspaces section
        if (results.workspaces && results.workspaces.length > 0) {
            html += '<div class="p-2 border-b border-gray-100">';
            html += '<div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Workspaces</div>';
            
            results.workspaces.forEach(workspace => {
                html += `
                    <a href="/workspaces/${workspace.slug}/" 
                       class="search-result-item flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer">
                        <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                            ${workspace.icon ? `<span class="text-sm">${workspace.icon}</span>` : '<i class="fas fa-layer-group text-indigo-600 text-sm"></i>'}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-gray-900 truncate">${this.highlightQuery(workspace.name)}</div>
                            ${workspace.description ? `<div class="text-sm text-gray-500 truncate">${this.highlightQuery(workspace.description)}</div>` : ''}
                        </div>
                        <div class="text-xs text-gray-400">Workspace</div>
                    </a>
                `;
            });
            
            html += '</div>';
        }
        
        // Pages section
        if (results.pages && results.pages.length > 0) {
            html += '<div class="p-2">';
            html += '<div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pages</div>';
            
            results.pages.forEach(page => {
                html += `
                    <a href="/workspaces/${page.workspace_slug}/pages/${page.id}/" 
                       class="search-result-item flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer">
                        <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            ${page.icon ? `<span class="text-sm">${page.icon}</span>` : '<i class="fas fa-file-alt text-gray-400 text-sm"></i>'}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-gray-900 truncate">${this.highlightQuery(page.title)}</div>
                            <div class="text-sm text-gray-500 truncate">
                                in ${page.workspace_name}
                                ${page.content_preview ? ` • ${this.highlightQuery(page.content_preview)}` : ''}
                            </div>
                        </div>
                        <div class="text-xs text-gray-400">Page</div>
                    </a>
                `;
            });
            
            html += '</div>';
        }
        
        this.resultsContainer.innerHTML = html;
        this.showResults();
    }
    
    highlightQuery(text) {
        if (!this.currentQuery || !text) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(this.currentQuery)})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    showLoadingState() {
        if (!this.resultsContainer) return;
        
        this.resultsContainer.innerHTML = `
            <div class="p-4 text-center">
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    <span class="text-gray-600">Searching...</span>
                </div>
            </div>
        `;
        this.showResults();
    }
    
    showErrorState() {
        if (!this.resultsContainer) return;
        
        this.resultsContainer.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <i class="fas fa-exclamation-triangle mb-2"></i>
                <div>Search failed. Please try again.</div>
            </div>
        `;
        this.showResults();
    }
    
    showNoResults() {
        if (!this.resultsContainer) return;
        
        this.resultsContainer.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <i class="fas fa-search mb-2"></i>
                <div>No results found for "${this.currentQuery}"</div>
            </div>
        `;
        this.showResults();
    }
    
    showResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.remove('hidden');
        }
    }
    
    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.add('hidden');
        }
    }
    
    navigateResults(direction) {
        const items = this.resultsContainer?.querySelectorAll('.search-result-item');
        if (!items || items.length === 0) return;
        
        const current = this.resultsContainer.querySelector('.search-result-item.bg-indigo-50');
        let nextIndex = 0;
        
        if (current) {
            const currentIndex = Array.from(items).indexOf(current);
            current.classList.remove('bg-indigo-50', 'text-indigo-700');
            
            if (direction === 'down') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            }
        }
        
        const nextItem = items[nextIndex];
        nextItem.classList.add('bg-indigo-50', 'text-indigo-700');
        nextItem.scrollIntoView({ block: 'nearest' });
    }
    
    selectResult() {
        const selected = this.resultsContainer?.querySelector('.search-result-item.bg-indigo-50');
        if (selected) {
            selected.click();
        }
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

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quillBoardSearch = new QuillBoardSearch();
});

// Export for use in templates
window.QuillBoardSearch = QuillBoardSearch;