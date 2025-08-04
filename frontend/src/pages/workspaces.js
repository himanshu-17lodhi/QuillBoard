import { apiClient } from '../services/api.js'

export function renderWorkspaces() {
  return `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Workspaces</h1>
        <button 
          class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onclick="openNewWorkspaceModal()"
        >
          <i class="fas fa-plus mr-2"></i>
          New Workspace
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="workspaces-grid">
        <!-- Sample workspace card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center mb-4">
            <div class="text-2xl mr-3">📝</div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Sample Workspace</h3>
              <p class="text-sm text-gray-500">3 pages • 2 databases</p>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-4">
            This is a sample workspace to get you started. Create your first workspace to begin organizing your content.
          </p>
          <div class="flex items-center justify-between">
            <div class="flex -space-x-2">
              <img
                class="w-8 h-8 rounded-full border-2 border-white"
                src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"
                alt="User"
              />
            </div>
            <span class="text-xs text-gray-500">Updated 2 days ago</span>
          </div>
        </div>

        <!-- New workspace card -->
        <div 
          class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors cursor-pointer"
          onclick="openNewWorkspaceModal()"
        >
          <div class="text-4xl text-gray-400 mb-4">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Create New Workspace</h3>
          <p class="text-sm text-gray-500">Start a new project or organize your content</p>
        </div>
      </div>
    </div>

    <!-- New Workspace Modal -->
    <div id="new-workspace-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Create New Workspace</h3>
            <button 
              onclick="closeNewWorkspaceModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <form id="new-workspace-form" onsubmit="handleCreateWorkspace(event)">
            <div class="space-y-4">
              <div>
                <label for="workspace-name" class="block text-sm font-medium text-gray-700">
                  Workspace Name
                </label>
                <input
                  id="workspace-name"
                  name="name"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter workspace name"
                />
              </div>
              
              <div>
                <label for="workspace-description" class="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  id="workspace-description"
                  name="description"
                  rows="3"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your workspace"
                ></textarea>
              </div>
              
              <div>
                <label for="workspace-icon" class="block text-sm font-medium text-gray-700">
                  Icon (optional)
                </label>
                <input
                  id="workspace-icon"
                  name="icon"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="📝"
                  maxlength="2"
                />
              </div>
            </div>
            
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onclick="closeNewWorkspaceModal()"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="create-workspace-button"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

// Global functions for workspace management
window.openNewWorkspaceModal = function() {
  document.getElementById('new-workspace-modal').classList.remove('hidden')
}

window.closeNewWorkspaceModal = function() {
  document.getElementById('new-workspace-modal').classList.add('hidden')
  document.getElementById('new-workspace-form').reset()
}

window.handleCreateWorkspace = async function(event) {
  event.preventDefault()
  
  const form = event.target
  const button = document.getElementById('create-workspace-button')
  
  // Get form data
  const formData = new FormData(form)
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    icon: formData.get('icon') || '📝'
  }
  
  // Show loading state
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating...'
  button.disabled = true
  
  try {
    const response = await apiClient.createWorkspace(data)
    if (response.success) {
      window.showNotification('Workspace created successfully', 'success')
      window.closeNewWorkspaceModal()
      // Reload workspaces list
      loadWorkspaces()
    } else {
      throw new Error(response.error || 'Failed to create workspace')
    }
  } catch (error) {
    window.showNotification(error.message, 'error')
  } finally {
    // Reset button state
    button.innerHTML = 'Create Workspace'
    button.disabled = false
  }
}

// Load workspaces from API
async function loadWorkspaces() {
  try {
    const response = await apiClient.getWorkspaces()
    if (response.success && response.data) {
      renderWorkspacesList(response.data)
    }
  } catch (error) {
    console.error('Failed to load workspaces:', error)
  }
}

function renderWorkspacesList(workspaces) {
  const grid = document.getElementById('workspaces-grid')
  if (!grid) return
  
  // Keep the "Create New Workspace" card
  const createCard = grid.querySelector('.bg-gray-50')
  
  // Clear existing workspace cards
  grid.innerHTML = ''
  
  // Add workspace cards
  workspaces.forEach(workspace => {
    const card = createWorkspaceCard(workspace)
    grid.appendChild(card)
  })
  
  // Re-add the create card
  if (createCard) {
    grid.appendChild(createCard)
  }
}

function createWorkspaceCard(workspace) {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'
  card.innerHTML = `
    <div class="flex items-center mb-4">
      <div class="text-2xl mr-3">${workspace.icon || '📝'}</div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">${workspace.name}</h3>
        <p class="text-sm text-gray-500">Click to open</p>
      </div>
    </div>
    <p class="text-gray-600 text-sm mb-4">
      ${workspace.description || 'No description provided.'}
    </p>
    <div class="flex items-center justify-between">
      <div class="flex -space-x-2">
        <img
          class="w-8 h-8 rounded-full border-2 border-white"
          src="https://ui-avatars.com/api/?name=${encodeURIComponent(workspace.created_by?.username || 'User')}&background=6366f1&color=fff"
          alt="${workspace.created_by?.username || 'User'}"
        />
      </div>
      <span class="text-xs text-gray-500">Updated ${formatDate(workspace.updated_at)}</span>
    </div>
  `
  
  card.addEventListener('click', () => {
    // Navigate to workspace detail page (to be implemented)
    window.showNotification(`Opening ${workspace.name}...`, 'info')
  })
  
  return card
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

// Load workspaces when the page is rendered
// Note: This will be called after the page renders
setTimeout(() => {
  if (document.getElementById('workspaces-grid')) {
    loadWorkspaces()
  }
}, 100)