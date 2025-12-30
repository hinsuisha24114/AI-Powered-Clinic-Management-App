# AI-Powered Clinic Management Application

A comprehensive web-based healthcare system designed to digitalize and automate daily clinical operations.

## Project Structure

```
AI-Powered Clinic Management App/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── database.py     # Database configuration
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth_utils.py   # Authentication utilities
│   │   ├── routers/        # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── appointments.py
│   │   │   ├── patients.py
│   │   │   ├── prescriptions.py
│   │   │   ├── billing.py
│   │   │   ├── queue.py
│   │   │   └── ai_assistant.py
│   │   └── services/       # Business logic services
│   │       ├── ai_service.py
│   │       ├── pdf_service.py
│   │       └── redis_service.py
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── .gitignore
│
└── frontend/               # React Frontend
    ├── src/
    │   ├── components/     # React components
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Header.jsx
    │   ├── pages/          # Page components
    │   │   ├── Dashboard.jsx
    │   │   └── Login.jsx
    │   ├── services/       # API services
    │   │   └── api.js
    │   ├── utils/          # Utility functions
    │   │   └── auth.js
    │   ├── App.jsx         # Main App component
    │   ├── main.jsx        # React entry point
    │   └── index.css      # Global styles
    ├── package.json        # Node dependencies
    ├── vite.config.js      # Vite configuration
    ├── tailwind.config.js  # Tailwind CSS configuration
    ├── postcss.config.js   # PostCSS configuration
    ├── index.html          # HTML template
    ├── .env.example        # Environment variables template
    └── .gitignore
```

## Technologies

### Backend
- FastAPI (Python)
- PostgreSQL
- Redis
- SQLAlchemy
- JWT Authentication
- Whisper (Voice-to-text)
- OpenAI API (LLM)

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

6. Update `.env` with your database and API credentials:
- Set `DATABASE_URL` for PostgreSQL
- Set `REDIS_URL` for Redis
- Set `SECRET_KEY` for JWT
- Set `OPENAI_API_KEY` for AI features

7. Run database migrations (if using Alembic):
```bash
alembic upgrade head
```

8. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

## Features

- **Doctor Dashboard**: View appointments, manage consultations
- **Appointment Management**: Schedule and track appointments
- **Patient Management**: Electronic medical records (EMR)
- **Queue Management**: Real-time token system with ETA
- **E-Prescriptions**: AI-assisted prescription generation
- **Billing**: Invoice generation and payment tracking
- **AI Features**: Voice transcription, SOAP notes, prescription suggestions

## Development

- Backend API runs on: `http://localhost:8000`
- Frontend runs on: `http://localhost:3000`
- API Documentation: `http://localhost:8000/docs` (Swagger UI)

## Next Steps

1. Implement database migrations with Alembic
2. Add WebSocket support for real-time updates
3. Integrate Whisper for voice transcription
4. Connect OpenAI API for LLM features
5. Implement PDF generation for prescriptions and invoices
6. Add Redis queue management
7. Build out all frontend pages and components
8. Add authentication flow
9. Implement all API endpoints

## License

This project is for educational purposes.



