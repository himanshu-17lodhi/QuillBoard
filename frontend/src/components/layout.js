import { renderNavigation } from './navigation.js'

export function renderLayout() {
  return `
    <div class="min-h-screen bg-gray-50">
      ${renderNavigation()}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Content will be inserted here -->
      </main>
    </div>
  `
}