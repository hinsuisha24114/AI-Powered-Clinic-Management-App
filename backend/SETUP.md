# Backend Setup and Run Instructions

## Prerequisites

1. **Python 3.8+** installed on your system
2. **PostgreSQL** database (optional for basic setup - can use SQLite for testing)
3. **Redis** (optional for queue features - can skip for basic setup)

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
```

**Linux/Mac:**
```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** If you encounter issues with PyTorch/Whisper installation, you can install a lighter version:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib python-multipart python-dotenv
```

### 5. Create Environment File

Create a `.env` file in the `backend` directory:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

Or manually create `.env` with:
```env
# Database (use SQLite for quick testing)
DATABASE_URL=sqlite:///./clinic.db

# Or PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/clinic_db

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI API (optional for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Server
HOST=0.0.0.0
PORT=8000

# CORS
FRONTEND_URL=http://localhost:3000
```

### 6. Update Database Configuration (Optional)

For quick testing without PostgreSQL, you can modify `backend/app/database.py` to use SQLite:

```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clinic.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
```

### 7. Run the Server

**Option 1: Using the run script**
```bash
python run.py
```

**Option 2: Using uvicorn directly**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Using uvicorn with Python module**
```bash
python -m uvicorn app.main:app --reload
```

## Verify Backend is Running

1. Open your browser and go to: `http://localhost:8000`
   - You should see: `{"message":"AI-Powered Clinic Management API","status":"running"}`

2. Check health endpoint: `http://localhost:8000/health`
   - You should see: `{"status":"healthy"}`

3. View API documentation: `http://localhost:8000/docs`
   - This opens Swagger UI with all available endpoints

4. Alternative docs: `http://localhost:8000/redoc`
   - ReDoc documentation interface

## Test API Endpoints

You can test the router endpoints:
- `http://localhost:8000/api/auth/test`
- `http://localhost:8000/api/appointments/test`
- `http://localhost:8000/api/patients/test`
- etc.

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change it:
```bash
uvicorn app.main:app --reload --port 8001
```

### Module Not Found Errors
Make sure you're in the `backend` directory and virtual environment is activated.

### Database Connection Errors
- For quick testing, use SQLite (no setup needed)
- For PostgreSQL, make sure the database server is running
- Check your `DATABASE_URL` in `.env` file

### Import Errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

## Next Steps

Once the backend is running:
1. Set up the database tables (will be created automatically on first run with SQLAlchemy)
2. Implement the actual API endpoints in the router files
3. Connect the frontend to the backend API



