import { apiClient } from '../services/api.js'

export function renderRegister() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 text-indigo-600 text-3xl text-center">
            <i class="fas fa-feather-alt"></i>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        <div id="general-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        </div>

        <form class="mt-8 space-y-6" id="register-form" onsubmit="handleRegisterSubmit(event)">
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
                placeholder="Choose a username"
                oninput="clearFieldError('username')"
              />
              <p id="username-error" class="mt-1 text-sm text-red-600 hidden"></p>
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                oninput="clearFieldError('email')"
              />
              <p id="email-error" class="mt-1 text-sm text-red-600 hidden"></p>
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
                placeholder="Create a password"
                oninput="clearFieldError('password')"
              />
              <p id="password-error" class="mt-1 text-sm text-red-600 hidden"></p>
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm your password"
                oninput="clearFieldError('confirmPassword')"
              />
              <p id="confirmPassword-error" class="mt-1 text-sm text-red-600 hidden"></p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              id="register-button"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create account
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" data-route="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  `
}

// Global register handler
window.handleRegisterSubmit = async function(event) {
  event.preventDefault()
  
  const form = event.target
  const button = document.getElementById('register-button')
  const generalError = document.getElementById('general-error')
  
  // Get form data
  const formData = new FormData(form)
  const username = formData.get('username')
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  
  // Clear previous errors
  clearAllErrors()
  
  // Client-side validation
  if (password !== confirmPassword) {
    showFieldError('confirmPassword', 'Passwords do not match')
    return
  }
  
  // Show loading state
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...'
  button.disabled = true
  
  try {
    const response = await apiClient.register({
      username,
      email,
      password,
      confirmPassword
    })
    
    if (response.success) {
      window.updateAuthState(response.user)
      window.router.navigate('/')
      window.showNotification('Account created successfully', 'success')
    } else {
      if (response.errors) {
        // Show field-specific errors
        Object.keys(response.errors).forEach(field => {
          if (response.errors[field].length > 0) {
            showFieldError(field, response.errors[field][0])
          }
        })
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    }
  } catch (error) {
    generalError.textContent = error.message
    generalError.classList.remove('hidden')
  } finally {
    // Reset button state
    button.innerHTML = 'Create account'
    button.disabled = false
  }
}

// Helper functions for error handling
window.clearFieldError = function(fieldName) {
  const input = document.getElementById(fieldName)
  const error = document.getElementById(`${fieldName}-error`)
  if (input) input.classList.remove('border-red-300')
  if (error) error.classList.add('hidden')
}

function showFieldError(fieldName, message) {
  const input = document.getElementById(fieldName)
  const error = document.getElementById(`${fieldName}-error`)
  if (input) input.classList.add('border-red-300')
  if (error) {
    error.textContent = message
    error.classList.remove('hidden')
  }
}

function clearAllErrors() {
  const fields = ['username', 'email', 'password', 'confirmPassword']
  fields.forEach(field => {
    window.clearFieldError(field)
  })
  const generalError = document.getElementById('general-error')
  if (generalError) generalError.classList.add('hidden')
}