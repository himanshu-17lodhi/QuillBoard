# QuillBoard - React Frontend + Django Backend

QuillBoard has been refactored to use a React SPA frontend with a Django REST API + Channels backend for real-time collaboration.

## Architecture

### Backend (Django)
- **Django REST API**: Handles all data operations and authentication
- **Django Channels**: Provides WebSocket support for real-time collaboration
- **Models**: User, Workspace, Page, Block, Database (unchanged)
- **Authentication**: Session-based auth for API requests

### Frontend (React)
- **React SPA**: Single Page Application with TypeScript
- **Tailwind CSS**: For styling and responsive design
- **React Router**: For client-side routing
- **Axios/Fetch**: For API communication
- **WebSocket**: For real-time collaboration features

## Development Setup

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Redis (for Django Channels)

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

4. Start Redis server:
```bash
redis-server
```

5. Start Django development server:
```bash
python manage.py runserver 8000
```

The Django API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start React development server:
```bash
npm run dev
```

The React app will be available at `http://localhost:5173/`

### Development Workflow

1. **Backend Development**: Django server runs on port 8000
2. **Frontend Development**: React dev server runs on port 5173
3. **API Communication**: React app proxies API requests to Django server
4. **CORS**: Configured to allow requests from React dev server
5. **WebSockets**: Connect to Django Channels for real-time features

## API Endpoints

### Authentication
- `GET /api/auth/user/` - Get current user info
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/register/` - Register new user

### Workspaces
- `GET /api/workspaces/` - List user's workspaces
- `POST /api/workspaces/` - Create new workspace
- `GET /api/workspaces/{slug}/` - Get workspace details
- `PATCH /api/workspaces/{slug}/` - Update workspace
- `DELETE /api/workspaces/{slug}/` - Delete workspace

### Pages
- `GET /api/workspaces/{slug}/pages/` - List workspace pages
- `POST /api/workspaces/{slug}/pages/` - Create new page
- `GET /api/pages/{id}/` - Get page details
- `PATCH /api/pages/{id}/` - Update page
- `DELETE /api/pages/{id}/` - Delete page

### Blocks
- `GET /api/pages/{id}/blocks/` - List page blocks
- `POST /api/pages/{id}/blocks/` - Create new block
- `PATCH /api/blocks/{id}/` - Update block
- `DELETE /api/blocks/{id}/` - Delete block

## WebSocket Endpoints

### Real-time Collaboration
- `ws://localhost:8000/ws/pages/{page_id}/` - Page-specific WebSocket
- `ws://localhost:8000/ws/workspaces/{workspace_slug}/` - Workspace-specific WebSocket

### WebSocket Message Types
- `block_update` - Block content changes
- `page_update` - Page title/metadata changes
- `cursor_position` - User cursor position
- `user_presence` - User online/offline status

## Production Setup

### Build React App

1. Build the React application:
```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized static files.

### Django Static Files

Django is configured to serve React build files from `frontend/dist/`:

```python
# settings.py
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'dist',
]
```

### Environment Variables

Create a `.env` file for production settings:

```env
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost/quillboard
REDIS_URL=redis://localhost:6379
```

### Deploy with Gunicorn + Nginx

1. **Gunicorn** for Django WSGI:
```bash
gunicorn quillboard.wsgi:application
```

2. **Daphne** for Django ASGI (WebSockets):
```bash
daphne -p 8001 quillboard.asgi:application
```

3. **Nginx** configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # React static files
    location / {
        try_files $uri $uri/ @react;
    }
    
    location @react {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## File Structure

```
QuillBoard/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── quillboard/          # Django project settings
│   ├── core/                # Core app (auth, users)
│   ├── workspaces/          # Workspace management
│   ├── pages/               # Page and block system
│   ├── databases/           # Database functionality
│   └── api/                 # REST API views
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and WebSocket services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── dist/                # Built React app (production)
└── README.md
```

## Key Features

### Authentication
- Session-based authentication with Django
- React forms for login/register
- Automatic redirect handling
- User profile management

### Real-time Collaboration
- WebSocket connections for live editing
- Block-level change synchronization
- User presence indicators
- Conflict resolution

### Block Editor
- Notion-style block system
- Drag and drop reordering
- Rich text editing
- Multiple block types (text, heading, lists, etc.)

### Workspace Management
- Multi-tenant workspace support
- Role-based permissions
- Invitation system
- Settings management

## Development Notes

### Backward Compatibility
- Django template views still available at `/django/` routes
- Gradual migration possible
- Admin interface unchanged at `/admin/`

### Security
- CORS properly configured
- CSRF protection for API endpoints
- Authentication required for sensitive operations
- Input validation and sanitization

### Performance
- React app code splitting
- Lazy loading of components
- Efficient WebSocket message handling
- Database query optimization

## Testing

### Backend Testing
```bash
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### End-to-End Testing
```bash
cd frontend
npm run e2e
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `CORS_ALLOWED_ORIGINS` in Django settings
2. **WebSocket Connection Failed**: Ensure Redis is running
3. **API 404 Errors**: Verify URL routing order in `urls.py`
4. **Build Errors**: Check Node.js version compatibility
5. **Static Files Not Loading**: Run `npm run build` and check `STATICFILES_DIRS`

### Debug Mode
- Set `DEBUG=True` in Django settings
- Use React dev tools in browser
- Check browser console for errors
- Monitor Django logs for API issues