export function renderDashboard() {
  return `
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to QuillBoard</h1>
        <p class="text-gray-600">Your collaborative workspace for notes, documents, and databases.</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-md transition-shadow" onclick="navigateTo('/workspaces')">
          <div class="flex items-center">
            <i class="fas fa-layer-group text-indigo-500 text-xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Workspaces</h3>
              <p class="text-gray-600">Organize your projects</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <i class="fas fa-file-alt text-green-500 text-xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Pages</h3>
              <p class="text-gray-600">Create and edit documents</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <i class="fas fa-database text-blue-500 text-xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Databases</h3>
              <p class="text-gray-600">Manage structured data</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 py-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-gray-700">Welcome to QuillBoard! Start by creating your first workspace.</span>
          </div>
        </div>
      </div>
    </div>
  `
}

// Global function for navigation
window.navigateTo = function(path) {
  window.router.navigate(path)
}