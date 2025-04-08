# ToDo List REST API (Andersen Test Task)

RESTful API application for managing a task list with React frontend and Django backend.

## Features

- JWT Authentication
- CRUD operations for tasks
- Swagger/OpenAPI documentation
- CORS configured for React development
- Environment-specific configurations
- PostgreSQL database support

## Requirements

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- npm/yarn

## Installation

### Backend Setup

1. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows

2. Install dependencies:
   pip install -r requirements.txt

3. Configure environment variables:
   cp .env.example .env
   nano .env  # Edit with your values

4. Run migrations:
   python manage.py migrate

5. Create superuser (optional):
   python manage.py createsuperuser

6. Start development server:
   python manage.py runserver

### Frontend Setup

1. Install dependencies:
   cd frontend
   npm install

2. Start development server:
   npm start

### Environment Configuration

Create .env file in project root:

### Development Configuration
DJANGO_ENVIRONMENT=development
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
POSTGRES_DB=todo_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# CORS
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

### Production Configuration
DJANGO_ENVIRONMENT=production
DJANGO_SECRET_KEY=your-production-secret-key
DEBUG=False

# Database
POSTGRES_DB=todo_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=strongpassword
POSTGRES_HOST=prod-db-host
POSTGRES_PORT=5432

# Security
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com