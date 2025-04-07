# ToDo List REST API (Andersen Test Task)

RESTful API application for managing a task list (ToDo list) with React frontend and Django backend.

## Features
- JWT Authentication
- CRUD operations for tasks
- Swagger/OpenAPI documentation
- CORS configured for React development

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
   Copy .env.example to .env
   Fill in your values

4. Run migrations:
   python manage.py migrate

5. Start development server:
   python manage.py runserver

### Frontend Setup
1. Install dependencies:
   cd frontend
   npm install

# ToDo List REST API (Andersen Test Task)

## Environment Configuration

The system uses environment variables for configuration. Create a `.env` file in the project root:

### Production (.env)
DJANGO_ENVIRONMENT=production
DJANGO_SECRET_KEY=your-production-secret-key
POSTGRES_DB=todo_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=strongpassword
POSTGRES_HOST=prod-db-host
POSTGRES_PORT=5432
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com

### Development (.env)
```ini
DJANGO_ENVIRONMENT=development
DJANGO_SECRET_KEY=your-secret-key
POSTGRES_DB=todo_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

