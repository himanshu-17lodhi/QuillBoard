import { apiClient } from '../services/api.js'

export function renderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 text-indigo-600 text-3xl text-center">
            <i class="fas fa-feather-alt"></i>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to QuillBoard
          </h2>
        </div>
        
        <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        </div>

        <form class="mt-8 space-y-6" id="login-form" onsubmit="handleLoginSubmit(event)">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              id="login-button"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" data-route="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  `
}

// Global login handler
window.handleLoginSubmit = async function(event) {
  event.preventDefault()
  
  const form = event.target
  const button = document.getElementById('login-button')
  const errorMessage = document.getElementById('error-message')
  
  // Get form data
  const formData = new FormData(form)
  const username = formData.get('username')
  const password = formData.get('password')
  
  // Show loading state
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...'
  button.disabled = true
  errorMessage.classList.add('hidden')
  
  try {
    const response = await apiClient.login(username, password)
    if (response.success) {
      // Update auth state and redirect
      window.updateAuthState(response.user)
      window.router.navigate('/')
      window.showNotification('Signed in successfully', 'success')
    } else {
      throw new Error(response.error || 'Login failed')
    }
  } catch (error) {
    errorMessage.textContent = error.message
    errorMessage.classList.remove('hidden')
  } finally {
    // Reset button state
    button.innerHTML = 'Sign in'
    button.disabled = false
  }
}