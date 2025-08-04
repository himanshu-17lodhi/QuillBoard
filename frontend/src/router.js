import { renderLogin } from './pages/login.js'
import { renderRegister } from './pages/register.js'
import { renderDashboard } from './pages/dashboard.js'
import { renderWorkspaces } from './pages/workspaces.js'
import { renderLayout } from './components/layout.js'

class Router {
  constructor() {
    this.routes = {
      '/': { component: renderDashboard, requiresAuth: true, layout: true },
      '/login': { component: renderLogin, requiresAuth: false, layout: false },
      '/register': { component: renderRegister, requiresAuth: false, layout: false },
      '/workspaces': { component: renderWorkspaces, requiresAuth: true, layout: true }
    }
    this.currentRoute = '/'
  }

  init() {
    // Handle initial route
    this.handleRoute(window.location.pathname)
  }

  navigate(path) {
    window.history.pushState(null, null, path)
    this.handleRoute(path)
  }

  handleRoute(path) {
    // Normalize path
    const route = this.routes[path] || this.routes['/']
    this.currentRoute = path

    // Check authentication requirements
    if (route.requiresAuth && !window.appState.isAuthenticated) {
      this.navigate('/login')
      return
    }

    // Redirect authenticated users away from auth pages
    if (!route.requiresAuth && window.appState.isAuthenticated && (path === '/login' || path === '/register')) {
      this.navigate('/')
      return
    }

    // Update app state
    window.appState.currentRoute = path

    // Render the page
    this.render(route)
  }

  render(route) {
    const app = document.getElementById('app')
    
    if (route.layout) {
      // Render with layout
      app.innerHTML = renderLayout()
      const main = document.querySelector('main')
      main.innerHTML = route.component()
    } else {
      // Render without layout (login, register)
      app.innerHTML = route.component()
    }
  }
}

export const router = new Router()