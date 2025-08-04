import { apiClient } from '../services/api.js'

export function renderNavigation() {
  const user = window.appState.user || { username: 'User' }
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`

  return `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/" data-route="/" class="text-2xl font-bold text-indigo-600">
              <i class="fas fa-feather-alt mr-2"></i>QuillBoard
            </a>
          </div>
          
          <div class="flex items-center space-x-4">
            <a href="/workspaces" data-route="/workspaces" class="text-gray-700 hover:text-indigo-600">
              <i class="fas fa-layer-group mr-1"></i>Workspaces
            </a>
            <div class="relative group">
              <button class="flex items-center text-gray-700 hover:text-indigo-600" onclick="toggleUserMenu(event)">
                <img 
                  src="${avatarUrl}" 
                  alt="${user.username}" 
                  class="w-8 h-8 rounded-full mr-2"
                />
                ${user.username}
                <i class="fas fa-chevron-down ml-1"></i>
              </button>
              <div id="user-menu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <i class="fas fa-user mr-2"></i>Profile
                </a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onclick="handleLogout(event)">
                  <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
}

// Global functions for navigation interactions
window.toggleUserMenu = function(event) {
  event.stopPropagation()
  const menu = document.getElementById('user-menu')
  menu.classList.toggle('hidden')
}

window.handleLogout = async function(event) {
  event.preventDefault()
  try {
    await apiClient.logout()
    window.updateAuthState(null)
    window.router.navigate('/login')
    window.showNotification('Logged out successfully', 'success')
  } catch {
    window.showNotification('Error logging out', 'error')
  }
}

// Close menu when clicking outside
document.addEventListener('click', () => {
  const menu = document.getElementById('user-menu')
  if (menu) {
    menu.classList.add('hidden')
  }
})