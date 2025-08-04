/**
 * QuillBoard UI Components Module
 * Reusable UI components and utilities
 */

class UIComponents {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupDropdowns();
        this.setupModals();
        this.setupTooltips();
        this.setupAnimations();
    }
    
    // Dropdown component
    setupDropdowns() {
        document.addEventListener('click', (e) => {
            const dropdown = e.target.closest('[data-dropdown-toggle]');
            if (dropdown) {
                e.preventDefault();
                const targetId = dropdown.dataset.dropdownToggle;
                const target = document.getElementById(targetId);
                if (target) {
                    this.toggleDropdown(target);
                }
                return;
            }
            
            // Close dropdowns when clicking outside
            const openDropdowns = document.querySelectorAll('.dropdown-menu:not(.hidden)');
            openDropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target) && !e.target.closest('[data-dropdown-toggle]')) {
                    dropdown.classList.add('hidden');
                }
            });
        });
    }
    
    toggleDropdown(dropdown) {
        // Close other dropdowns
        document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(other => {
            if (other !== dropdown) {
                other.classList.add('hidden');
            }
        });
        
        dropdown.classList.toggle('hidden');
    }
    
    // Modal component
    setupModals() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Close modals when clicking backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal(e.target.querySelector('.modal-content').closest('.modal'));
            }
        });
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            // Add animation
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.add('animate-modal-enter');
            }
        }
    }
    
    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        
        if (modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.add('animate-modal-exit');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    content.classList.remove('animate-modal-enter', 'animate-modal-exit');
                    document.body.classList.remove('overflow-hidden');
                }, 150);
            } else {
                modal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            this.closeModal(modal);
        });
    }
    
    // Tooltip component
    setupTooltips() {
        let tooltip = null;
        
        document.addEventListener('mouseenter', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) {
                const text = element.dataset.tooltip;
                const position = element.dataset.tooltipPosition || 'top';
                this.showTooltip(element, text, position);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element) {
                this.hideTooltip();
            }
        }, true);
    }
    
    showTooltip(element, text, position = 'top') {
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left, top;
        
        switch (position) {
            case 'bottom':
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.bottom + 5;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 5;
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                break;
            case 'right':
                left = rect.right + 5;
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                break;
            default: // top
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.top - tooltipRect.height - 5;
        }
        
        tooltip.style.left = `${Math.max(5, left)}px`;
        tooltip.style.top = `${Math.max(5, top)}px`;
        
        // Add entrance animation
        tooltip.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            tooltip.classList.remove('opacity-0', 'scale-95');
            tooltip.classList.add('opacity-100', 'scale-100', 'transition-all', 'duration-150');
        }, 10);
        
        this.currentTooltip = tooltip;
    }
    
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
    
    // Animation utilities
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Loading states
    showLoading(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.add('loading');
            element.innerHTML = `
                <div class="flex items-center justify-center p-4">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                    <span class="text-gray-600">${text}</span>
                </div>
            `;
        }
    }
    
    hideLoading(element, originalContent = '') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.remove('loading');
            element.innerHTML = originalContent;
        }
    }
    
    // Form validation
    validateForm(form) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (!form) return true;
        
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('border-red-500');
        
        const error = document.createElement('div');
        error.className = 'field-error text-red-500 text-sm mt-1';
        error.textContent = message;
        
        field.parentNode.appendChild(error);
    }
    
    clearFieldError(field) {
        field.classList.remove('border-red-500');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Notification system
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${this.getNotificationClasses(type)}`;
        
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }
        
        return notification;
    }
    
    getNotificationClasses(type) {
        switch (type) {
            case 'success':
                return 'bg-green-50 border border-green-200';
            case 'error':
                return 'bg-red-50 border border-red-200';
            case 'warning':
                return 'bg-yellow-50 border border-yellow-200';
            default:
                return 'bg-blue-50 border border-blue-200';
        }
    }
    
    getNotificationIcon(type) {
        const baseClasses = 'w-5 h-5';
        switch (type) {
            case 'success':
                return `<i class="fas fa-check-circle ${baseClasses} text-green-400"></i>`;
            case 'error':
                return `<i class="fas fa-exclamation-circle ${baseClasses} text-red-400"></i>`;
            case 'warning':
                return `<i class="fas fa-exclamation-triangle ${baseClasses} text-yellow-400"></i>`;
            default:
                return `<i class="fas fa-info-circle ${baseClasses} text-blue-400"></i>`;
        }
    }
    
    // Utility functions
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
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
        };
    }
    
    // Element utilities
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }
    
    // Animation helpers
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    fadeOut(element, duration = 300) {
        const start = performance.now();
        const initialOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = (initialOpacity * (1 - progress)).toString();
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Initialize UI components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiComponents = new UIComponents();
});

// Export for use in templates
window.UIComponents = UIComponents;