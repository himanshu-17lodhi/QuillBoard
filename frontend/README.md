# QuillBoard Frontend

A modern, Notion-like collaborative workspace built with vanilla JavaScript, HTML, CSS, and Tailwind CSS.

## Features

- **Vanilla JavaScript SPA**: No React dependencies, pure JavaScript with modern ES6+ features
- **Tailwind CSS**: Beautiful, responsive UI components
- **Authentication**: Login and registration flows
- **Workspaces**: Create and manage collaborative workspaces
- **API Integration**: RESTful API client for backend communication
- **WebSocket Support**: Real-time collaboration features
- **Modern Build Tools**: Vite for fast development and optimized builds

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout.js       # Main application layout
│   └── navigation.js   # Navigation header
├── pages/              # Application pages
│   ├── dashboard.js    # Main dashboard
│   ├── login.js        # Login page
│   ├── register.js     # Registration page
│   └── workspaces.js   # Workspaces management
├── services/           # API and WebSocket services
│   ├── api.js          # REST API client
│   └── websocket.js    # WebSocket service
├── types/              # TypeScript type definitions
├── router.js           # Client-side routing
├── main.js             # Application entry point
└── index.css           # Global styles (Tailwind)
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **API**: Fetch API for HTTP requests
- **Real-time**: WebSocket API
- **Icons**: Font Awesome
- **Linting**: ESLint

## API Integration

The application includes a robust API client that handles:

- Authentication (login/logout/registration)
- Workspace management
- Page and block operations
- Error handling and CSRF protection
- Session management

## WebSocket Features

Real-time collaboration features include:

- Live block updates
- Page synchronization
- Cursor position sharing
- Connection management with auto-reconnect
