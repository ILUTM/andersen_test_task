# ToDo List Application (DRF + React)

   RESTful API application for managing a task list with React frontend and Django backend.

## Features

### 🔐 Authentication
- JWT auth with secure cookies
- User registration & login/logout
- Profile management

### ✅ Task Management
- Full CRUD operations (owner-only edits)
- Status tracking (New → In Progress → Completed)
- Title edit window (5 minutes after creation)

### 🔍 Smart Filtering
- Pagination (10 items/page)
- Search by title/description
- Filter by status/user
- Sort by date/title

### ⚙️ Technical
- PostgreSQL database
- Optimized queries with indexes
- DRF-powered REST API
- React frontend

## Technologies Used

### Backend

- Python 3.12.7
- Django 5.2
- Django REST Framework 3.16.0
- Django REST Framework Simple JWT 5.5.0
- PostgreSQL 15 (via psycopg2 2.9.10)
- Django CORS Headers 4.7.0
- Django Filter 25.1
- Python Dotenv 1.1.0

### Frontend

- Node.js 20.18.0
- React 19.1.0
- React Router DOM 7.5.0
- React Scripts 5.0.1
- CSS Modules for styling

## Installation

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- pgAdmin 4 (optional)
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ILUTM/andersen_test_task.git
   cd backend
2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .\.venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source .venv/bin/activate
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
4. Configure environment variables:
   Copy .env.example to .env
   Set your PostgreSQL credentials:
   ```bash
   POSTGRES_DB=todo_dev
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   DJANGO_SECRET_KEY=django-key
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
5. Run database migrations:
   ```bash
   python manage.py migrate
6. Start development server:
   ```bash
   python manage.py runserver

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd ../frontend
2. Install Node.js dependencies:
   ```bash
   npm install
3. Configure environment variables:
   Copy .env.example to .env
   Set API base URL:
   ```bash
   REACT_APP_API_BASE_URL=http://localhost:8000
4. Start development server:
   ```bash
   npm start

## API Documentation

### Authentication Endpoints

| Endpoint         | Method | Description                     | Request Body Example                        | Success Response                          |
|------------------|--------|---------------------------------|---------------------------------------------|-------------------------------------------|
| `/api/auth/register/` | POST | Register new user | `{ "first_name": "John", "username": "john123", "password": "secure123" }` | `{ "user": {user_data}, "refresh": "xxx", "access": "xxx" }` |
| `/api/auth/login/`    | POST | User login        | `{ "username": "john123", "password": "secure123" }` | Sets HTTP-only cookie + returns `{ "user": {user_data}, "access": "xxx" }` |
| `/api/auth/refresh/`  | POST | Refresh token     | (Uses cookie)                              | New `access` token |
| `/api/auth/logout/`   | POST | Invalidate tokens | (Uses cookie)                              | Clears cookie + `{ "detail": "Logged out" }` |

### Task Endpoints

| Endpoint                     | Method | Description                     | Parameters               | Request Body Example               | Response Example |
|------------------------------|--------|---------------------------------|--------------------------|------------------------------------|------------------|
| `/api/tasks/`                | GET    | List all tasks (paginated)      | `?status=COMPLETED`, `?ordering=-created_at`, `?user_id=<id>` | - | `{ "results": [{task_data}], "pagination": {...}}` |
| `/api/tasks/`                | POST   | Create new task                 | -                        | `{ "title": "Task 1" }`           | `{task_data}` |
| `/api/tasks/<task_id>/`      | GET    | Get task details                | -                        | -                                  | `{task_data}` |
| `/api/tasks/<task_id>/`      | PUT    | Full task update                | -                        | `{ "title": "Updated", "status": "IN_PROGRESS" }` | `{task_data}` |
| `/api/tasks/<task_id>/`      | PATCH  | Partial task update             | -                        | `{ "description": "New desc" }`   | `{task_data}` |
| `/api/tasks/<task_id>/`      | DELETE | Delete task                     | -                        | -                                  | `204 No Content` |
| `/api/tasks/my_tasks/`       | GET    | Get current user's tasks        | `?page=2&page_size=5`    | -                                  | `{ "results": [...] }` |
| `/api/tasks/search/`         | GET    | Search tasks by title           | `?q=search_term`         | -                                  | `{ "results": [...] }` |
| `/api/tasks/<task_id>/complete/` | POST | Mark as completed | - | - | `{task_data}` |
| `/api/tasks/<task_id>/update_title/` | PATCH | Update task title (within 5 mins) | - | `{ "title": "New title" }` | `{task_data}` or `403` |
| `/api/tasks/<task_id>/update_description/` | PATCH | Update description | - | `{ "description": "New desc" }` | `{task_data}` |
| `/api/tasks/<task_id>/update_status/` | PATCH | Update status | - | `{ "status": "IN_PROGRESS" }` | `{task_data}` |

**Task Object Structure**:
```json
{
  "id": 1,
  "user": "username",
  "title": "Task title",
  "description": "Optional description",
  "status": "NEW",
  "created_at": "2025-04-13T10:00:00Z",
  "updated_at": "2025-04-13T10:00:00Z"
}

