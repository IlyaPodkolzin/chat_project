# Chat Application

A real-time chat application built with Django, FastAPI, TypeScript, and PostgreSQL.

## Features

- User authentication and authorization
- Group chats with interests
- Anonymous chat matching
- Real-time messaging
- User profiles and chat management

## Tech Stack

- Backend:
  - Django (main web framework)
  - FastAPI (real-time features)
  - PostgreSQL (database)
- Frontend:
  - TypeScript
  - React
  - Material-UI

## Setup Instructions

1. Create and activate a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up PostgreSQL database and update settings in `.env` file

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the development servers:
```bash
# Terminal 1 - Django server
python manage.py runserver

# Terminal 2 - FastAPI server
uvicorn backend.fastapi_app:app --reload

# Terminal 3 - Frontend development server
cd frontend
npm run dev
```

## Project Structure

```
chat_project/
├── backend/                 # Django backend
│   ├── chat/               # Chat app
│   ├── users/              # Users app
│   └── fastapi_app.py      # FastAPI application
├── frontend/               # TypeScript frontend
│   ├── src/
│   └── package.json
└── requirements.txt        # Python dependencies
``` 