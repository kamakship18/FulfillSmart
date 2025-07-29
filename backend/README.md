## 🎯 Overview

The FulfillSmart Backend is a high-performance FastAPI-based REST API that powers the warehouse management and optimization platform. It provides comprehensive endpoints for data processing, warehouse simulation, analytics, and AI-powered optimization recommendations.

### Key Features
- **File Processing**: Excel/CSV upload and data extraction
- **Warehouse Simulation**: Advanced performance modeling and analysis
- **AI Optimization**: Machine learning-powered layout recommendations
- **Real-time Analytics**: Cost analysis and performance metrics
- **Interactive API Documentation**: Auto-generated Swagger UI

### Technology Stack
- **Framework**: FastAPI 0.104+
- **Server**: Uvicorn ASGI server
- **Data Processing**: Pandas, NumPy, OpenPyXL
- **Validation**: Pydantic models
- **CORS**: FastAPI CORS middleware for frontend integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│  Routes Layer                                               │
│  ├── /api/upload          (File Processing)                 │
│  ├── /api/summary         (Data Summary)                    │
│  ├── /api/data            (Raw Data Access)                 │
│  ├── /api/analytics/*     (Analytics Endpoints)            │
│  └── /api/blueprint/*     (Warehouse Simulation)           │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── process_excel.py     (Data Processing Logic)          │
│  └── simulator.py         (Simulation Engine)              │
├─────────────────────────────────────────────────────────────┤
│  Models Layer                                               │
│  └── city_summary.py      (Data Models & Schemas)          │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  └── In-Memory Storage    (Global State Management)        │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- **Python 3.8+** (recommended: Python 3.9+)
- **pip** (Python package manager)
- **Virtual Environment** (recommended)

### Quick Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/kamakship18/FulfillSmart.git
cd FulfillSmart/backend

# Create and activate virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Development Mode

#### Method 1: Using the start script (Recommended)
```bash
python start_server.py
```

#### Method 2: Direct uvicorn command
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Method 3: Python main execution
```bash
python main.py
```
backend/
├── main.py                    # FastAPI application entry point
├── start_server.py           # Development server launcher
├── requirements.txt          # Python dependencies
│
├── routes/                   # API route handlers
│   ├── __init__.py          # Package initialization
│   ├── analytics.py         # Analytics endpoints
│   ├── blueprint.py         # Warehouse simulation & optimization
│   ├── data.py              # Raw data access endpoints
│   ├── simulate.py          # File processing endpoints
│   └── summary.py           # Data summary endpoints
│
├── services/                 # Business logic services
│   ├── __init__.py          # Package initialization
│   ├── process_excel.py     # Excel/CSV processing logic
│   └── simulator.py         # Warehouse simulation engine
│
├── models/                   # Data models and schemas
│   ├── __init__.py          # Package initialization
│   └── city_summary.py      # City-based logistics models
│
├── static/                   # Static files (if any)
│
├── venv/                     # Virtual environment (local)
└── __pycache__/             # Python bytecode cache (auto-generated)
```