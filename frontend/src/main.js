import './index.css'
import { router } from './router.js'
import { apiClient } from './services/api.js'

// Simple state management
window.appState = {
  user: null,
  currentRoute: '/',
  isAuthenticated: false,
  loading: false
}

// Expose globally needed objects
window.router = router
window.apiClient = apiClient

// Initialize the application
async function initApp() {
  try {
    // Check if user is authenticated
    const userResponse = await apiClient.getCurrentUser()
    if (userResponse.authenticated && userResponse.user) {
      window.appState.user = userResponse.user
      window.appState.isAuthenticated = true
    }
  } catch (error) {
    console.log('User not authenticated:', error)
  }

  // Initialize router
  router.init()
  
  // Set up navigation event listeners
  setupNavigation()
}

// Set up navigation event handling
function setupNavigation() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    router.handleRoute(window.location.pathname)
  })

  // Handle navigation links
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-route]')
    if (link) {
      event.preventDefault()
      const route = link.getAttribute('data-route')
      router.navigate(route)
    }
  })
}

// Utility functions for updating UI
window.updateAuthState = (user) => {
  window.appState.user = user
  window.appState.isAuthenticated = !!user
  // Re-render current route to update navigation
  router.handleRoute(window.location.pathname)
}

window.showNotification = (message, type = 'info') => {
  // Simple notification system
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 p-4 rounded-md z-50 ${
    type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
    type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
    'bg-blue-100 border border-blue-400 text-blue-700'
  }`
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Start the application
initApp()