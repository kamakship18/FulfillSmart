# 🏭 FulfillSmart - AI-Powered Warehouse Management System

## 🎯 Overview

FulfillSmart is a comprehensive AI-powered warehouse management and optimization platform that helps businesses design, simulate, and optimize their warehouse operations. The platform combines data-driven insights with interactive warehouse design tools to maximize efficiency and reduce operational costs.

### Key Capabilities
- **AI-Driven Warehouse Design**: Automatically generate optimal warehouse layouts based on demand data
- **Interactive Blueprint Designer**: Drag-and-drop interface for warehouse zone configuration
- **Advanced Simulation Engine**: Comprehensive performance analysis and bottleneck identification
- **Data Analytics Dashboard**: Real-time insights and KPI tracking
- **Cost Optimization**: ROI analysis and cost-saving recommendations

## ✨ Features

### 🔧 Core Features
- **Data Upload & Processing**: Excel/CSV file processing for logistics data
- **Smart Warehouse Blueprint Generation**: AI-powered layout optimization
- **Interactive Zone Management**: Drag, resize, and configure warehouse zones
- **Performance Simulation**: Advanced workflow and efficiency analysis
- **Multi-dimensional Analytics**: Zone utilization, workforce optimization, cost analysis
- **Export & Sharing**: Save and share warehouse designs and reports

### 🤖 AI-Powered Features
- Demand-based warehouse sizing and layout optimization
- Intelligent zone placement and sizing recommendations
- Workforce allocation optimization based on demand patterns
- Automated bottleneck detection and resolution suggestions
- Predictive scaling recommendations for future growth

### 📊 Analytics & Reporting
- Real-time performance dashboards
- Comprehensive simulation results with interactive charts
- Cost-benefit analysis and ROI calculations
- Export capabilities for reports and blueprints

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Data Layer    │
│   (Next.js)     │◄──►│   (FastAPI)      │◄──►│   (In-Memory)   │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Python 3.8+   │    │ • Global Store  │
│ • Tailwind CSS  │    │ • FastAPI        │    │ • Session Data  │
│ • Zustand Store │    │ • Pandas/NumPy   │    │ • File Processing│
│ • Recharts      │    │ • OpenPyXL       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kamakship18/FulfillSmart.git
cd FulfillSmart
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node.js dependencies
npm install

# Or using yarn
yarn install
```

## 🚀 Running the Application

### Development Mode

#### 1. Start the Backend Server

```bash
# From the backend directory
cd backend

# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Start the FastAPI server
python start_server.py

# Alternative method:
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: **http://localhost:8000**

#### 2. Start the Frontend Development Server

```bash
# From the frontend directory (new terminal)
cd frontend

# Start the Next.js development server
npm run dev

# Alternative:
# yarn dev
```

The frontend application will be available at: **http://localhost:3000**


## 📁 Project Structure

```
FulfillSmart/
├── README.md                 # This file
├── layout.png               # System architecture diagram
├── sample_logistics_data.csv # Sample data for testing
├── 
├── backend/                 # FastAPI Backend
│   ├── main.py             # FastAPI application entry point
│   ├── start_server.py     # Development server launcher
│   ├── requirements.txt    # Python dependencies
│   ├── 
│   ├── routes/            # API route handlers
│   │   ├── analytics.py   # Analytics and insights endpoints
│   │   ├── blueprint.py   # Warehouse simulation and optimization
│   │   ├── data.py        # Data access and management
│   │   ├── simulate.py    # File processing and simulation
│   │   └── summary.py     # Data summary and aggregation
│   ├── 
│   ├── services/          # Business logic services
│   │   ├── process_excel.py # Excel/CSV file processing
│   │   └── simulator.py   # Warehouse simulation engine
│   ├── 
│   ├── models/           # Data models and schemas
│   │   └── city_summary.py # City-based logistics models
│   └── 
│   └── static/           # Static files and assets
│
└── frontend/             # Next.js Frontend
    ├── package.json      # Node.js dependencies and scripts
    ├── next.config.mjs   # Next.js configuration
    ├── tailwind.config.js # Tailwind CSS configuration
    ├── postcss.config.mjs # PostCSS configuration
    ├── 
    ├── src/
    │   ├── app/          # Next.js 13+ App Router pages
    │   │   ├── page.js   # Home/Dashboard page
    │   │   ├── layout.js # Root layout component
    │   │   ├── globals.css # Global styles
    │   │   ├── blueprint/ # Warehouse blueprint designer
    │   │   ├── dashboard/ # Analytics dashboard
    │   │   ├── insights/  # Data insights and recommendations
    │   │   ├── map/      # Geographic distribution view
    │   │   └── upload/   # Data upload interface
    │   ├── 
    │   ├── components/   # Reusable React components
    │   │   ├── ui/       # Base UI components (shadcn/ui)
    │   │   ├── Charts.js # Data visualization components
    │   │   ├── FileUploader.js # File upload interface
    │   │   ├── Navbar.js # Navigation component
    │   │   ├── WarehouseCanvas.js # Interactive warehouse designer
    │   │   └── SimulationResults.js # Simulation output display
    │   ├── 
    │   ├── store/        # Global state management
    │   │   └── blueprintStore.js # Zustand store for blueprint data
    │   ├── 
    │   ├── utils/        # Utility functions
    │   │   └── api.js    # API client and HTTP utilities
    │   └── 
    │   └── lib/          # Shared libraries
        └── utils.js      # Common utility functions
```


### Base URL
- **Development**: `http://localhost:8000`

## 📚 Usage Guide

### 1. Data Upload and Processing
1. Navigate to the Upload page (`/upload`)
2. Upload your logistics data (Excel/CSV format)
3. Review the processed data summary
4. Proceed to analytics or blueprint design

### 2. Warehouse Blueprint Design
1. Go to the Blueprint page (`/blueprint`)
2. If you have uploaded data, click "Generate Smart Blueprint" for AI-powered design
3. Manually add zones using the "Add Custom Zone" button
4. Drag and resize zones on the interactive canvas
5. Configure warehouse dimensions and workforce settings

### 3. Performance Simulation
1. Configure your warehouse layout and workforce
2. Switch to the "Simulate & Test" tab
3. Click "Run Data-Driven Simulation"
4. Review comprehensive results including:
   - Zone efficiency analysis
   - Workflow optimization recommendations
   - Workforce utilization metrics
   - Cost-benefit analysis

### 4. Analytics and Insights
1. Visit the Dashboard (`/dashboard`) for overview metrics
2. Check Insights (`/insights`) for detailed recommendations
3. Use the Map view (`/map`) for geographic distribution analysis

## ⚙️ Configuration

### Backend Configuration

The backend can be configured through environment variables or by modifying configuration files:

```python
# backend/main.py - Key configurations
CORS_ORIGINS = ["http://localhost:3000"]  # Frontend URL
API_PREFIX = "/api"
DEBUG_MODE = True  # Set to False in production
```

### Frontend Configuration

```javascript
// frontend/src/utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```


### Code Style and Standards
- **Backend**: Follow PEP 8 Python style guidelines
- **Frontend**: Use ESLint and Prettier for consistent formatting
- **Commits**: Use conventional commit messages

### Development Workflow
1. Create feature branches from `main`
2. Make changes and test locally
3. Run linting and type checking
4. Submit pull requests for review

### Useful Development Commands

#### Backend
```bash
# Run with auto-reload
uvicorn main:app --reload

# Install new dependencies
pip install package_name
pip freeze > requirements.txt

# Run tests (if implemented)
pytest tests/
```

#### Frontend
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

