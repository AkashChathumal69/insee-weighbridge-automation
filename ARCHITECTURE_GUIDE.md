# Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Application Components                        │ │
│  ├─ PlateDetection.jsx (Plate recognition)                   │ │
│  ├─ WaitInForm.jsx (Data entry)                              │ │
│  ├─ ProcessQueue.jsx (Data display)                          │ │
│  └─ DataManagement.jsx ⭐ NEW (Export/Import/Backup)        │ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          State Management (React Context)                  │ │
│  ├─ ProcessContext.jsx ✏️ UPDATED (+ API integration)        │ │
│  └─ dataManagementService.js ⭐ NEW (API calls)              │ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │             HTTP Requests (Fetch API)                      │ │
│  └─────┬──────────────────────────────────────────────────────┘ │
└───────┼──────────────────────────────────────────────────────────┘
        │ HTTP POST/GET/PUT/DELETE
        │ Port 3000 ↔ Port 5000
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask/Python)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              API Routes & Controllers                      │ │
│  ├─ /health - Health check                                   │ │
│  ├─ /detect - Plate detection                                │ │
│  ├─ /detect-base64 - Base64 plate detection                  │ │
│  ├─ /api/processes/* ⭐ NEW (CRUD operations)                │ │
│  ├─ /api/export/* ⭐ NEW (Excel operations)                   │ │
│  └─ /api/backup ⭐ NEW (Backup operations)                   │ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Data Access Layer (Database & Files)               │ │
│  ├─ database.py ⭐ NEW (JSON persistence)                    │ │
│  └─ excel_handler.py ⭐ NEW (Excel I/O)                      │ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         External Libraries & Services                      │ │
│  ├─ api.py - Main Flask application ✏️ UPDATED              │ │
│  ├─ YOLO - Plate detection model                             │ │
│  ├─ OpenCV - Image processing                                │ │
│  ├─ EasyOCR - Text recognition                               │ │
│  ├─ Pandas - Data manipulation ⭐ NEW                        │ │
│  └─ OpenPyXL - Excel file handling ⭐ NEW                    │ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              File System Access                            │ │
│  └─────┬──────────────────────────────────────────────────────┘ │
└───────┼──────────────────────────────────────────────────────────┘
        │ Read/Write Files
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FILE SYSTEM (Disk Storage)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   slnp/Database/ ⭐ NEW                    │ │
│  ├─ data.json (Main database - JSON format) ⭐ NEW            │ │
│  ├─ exports/ ⭐ NEW                                            │ │
│  │  └─ process_data_20260116_103045.xlsx                     │ │
│  └─ backups/ ⭐ NEW                                            │ │
│     └─ backup_20260116_103045.json                           │ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Existing Directories                     │ │
│  ├─ slnp/Output/                                              │ │
│  ├─ slnp/CarPictures/                                         │ │
│  └─ slnp/test/                                                │ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Adding a New Entry
```
1. User fills "Vehicle Arrival" form
   ├─ Vehicle Number, Driver Info, etc.
   └─ Click "Submit"

2. Frontend (React)
   ├─ Validates form data
   ├─ Generates token via ProcessContext
   └─ Sends POST to /api/processes

3. Backend (Flask)
   ├─ Receives POST request
   ├─ Calls Database.add_process()
   └─ Saves to slnp/Database/data.json

4. Frontend Update
   ├─ Receives success response
   ├─ Updates processQueue state
   └─ Displays new entry in queue

5. Persistence
   ├─ Data saved in database
   ├─ Survives page refresh
   └─ Survives app restart ✓
```

### Exporting to Excel
```
1. User clicks "Export to Excel"
   └─ In DataManagement component

2. Frontend
   ├─ Calls exportToExcel() from context
   └─ Sends GET /api/export/excel

3. Backend
   ├─ Calls Database.get_all_processes()
   ├─ Calls ExcelHandler.export_to_excel()
   ├─ Formats data with pandas
   ├─ Creates .xlsx file with openpyxl
   ├─ Saves to slnp/Database/exports/
   └─ Sends file to browser

4. Browser
   ├─ Receives binary Excel file
   ├─ Triggers download dialog
   └─ Saves as process_data_TIMESTAMP.xlsx

5. User
   └─ Opens Excel in Office/Sheets
```

### Importing from Excel
```
1. User clicks "Import from Excel"
   ├─ Selects file from file picker
   └─ Sends POST with file to /api/import/excel

2. Backend
   ├─ Receives multipart form data
   ├─ Saves to temporary file
   ├─ Calls ExcelHandler.import_from_excel()
   ├─ Parses Excel with pandas
   ├─ Validates data structure
   └─ Cleans up temp file

3. Database
   ├─ Merges imported data with existing
   └─ Saves to slnp/Database/data.json

4. Frontend
   ├─ Receives success response
   ├─ Reloads from backend
   ├─ Updates processQueue state
   └─ Shows success message

5. Data
   └─ Now available in the system ✓
```

## Component Hierarchy

```
App.jsx
├── ThemeProvider
└── ProcessProvider ✏️ UPDATED
    ├── Header/Sidebar Navigation
    │   └── Links to sections
    │
    ├── PlateDetection
    │   └─ Uses setDetectedVehicleNumber
    │
    ├── WaitInForm
    │   └─ Uses addWaitInEntry()
    │
    ├── ProcessQueue
    │   ├─ Uses processQueue
    │   └─ Uses updateWaitOutEntry()
    │
    ├── DataManagement ⭐ NEW
    │   ├─ Uses exportToExcel()
    │   ├─ Uses importFromExcel()
    │   ├─ Uses createBackup()
    │   ├─ Uses loadProcessesFromBackend()
    │   ├─ Uses processQueue
    │   ├─ Uses loading state
    │   └─ Uses error state
    │
    ├── DispatchStats
    │   └─ Uses processQueue
    │
    └── Other Components
```

## Database Schema (Visual)

```
┌─────────────────────────────────────────────────────────┐
│              slnp/Database/data.json                    │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   "processes": [                                        │
│     {                                                   │
│       "id": "1234567890.123",                          │
│       "tokenNumber": "S-01",          ← Unique Key     │
│       "vehicleNumber": "ABC-1234",                     │
│       "date": "12/15/2026",                            │
│       "arrivalTime": "10:30",                          │
│       "status": "Pending|Finished",                    │
│       "waitIn": {                                       │
│         "driverName": "John Doe",                      │
│         "driverPhone": "0701234567",                   │
│         "driverTown": "Colombo",                       │
│         "helperName": "Jane Doe",                      │
│         "vehicleInsurance": true,                      │
│         "deliveryTable": [                            │
│           {                                            │
│             "brand": "Sanstha",                        │
│             "requestedBag": 100,                       │
│             "deliveryBag": 95                         │
│           },                                           │
│           { ... more brands ... }                      │
│         ]                                              │
│       },                                               │
│       "waitOut": {                  ← null until updated
│         "departureTime": "14:15",                      │
│         "totalIssue": "5 bags",                        │
│         "notes": "Items damaged",                      │
│         "deliveryTable": [ ... ]                       │
│       },                                               │
│       "created_at": "2026-01-16T10:30:00",            │
│       "updated_at": "2026-01-16T14:15:00"             │
│     },                                                 │
│     { ...more processes... }                           │
│   ],                                                   │
│   "daily_tokens": {                                    │
│     "S": 15,        ← Counter for Sanstha tokens      │
│     "MP": 8,        ← Counter for Marine Plus tokens  │
│     "MM": 5,        ← Counter for Mahamera tokens     │
│     ...                                                │
│   },                                                   │
│   "last_updated": "2026-01-16T14:15:00"               │
│ }                                                      │
└─────────────────────────────────────────────────────────┘
```

## API Endpoint Map

```
┌─────────────────────────────────────────────────────────┐
│         HTTP API Endpoints (localhost:5000)             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ GET /health                                             │
│ └─ Status: 200 OK                                       │
│                                                         │
│ POST /detect                                            │
│ ├─ Input: Multipart form with image file              │
│ └─ Output: Detections, detections count, image         │
│                                                         │
│ POST /detect-base64                                     │
│ ├─ Input: JSON with base64 image                       │
│ └─ Output: Detections, detections count, image         │
│                                                         │
│ ⭐ NEW ENDPOINTS:                                       │
│                                                         │
│ GET /api/processes                                      │
│ ├─ Params: None                                         │
│ └─ Response: All process entries (JSON array)           │
│                                                         │
│ POST /api/processes                                     │
│ ├─ Body: Process object (JSON)                          │
│ └─ Response: Created process with ID                    │
│                                                         │
│ GET /api/processes/<token_number>                       │
│ ├─ Params: token_number (e.g., "S-01")                │
│ └─ Response: Specific process or 404                    │
│                                                         │
│ PUT /api/processes/<token_number>                       │
│ ├─ Params: token_number, Body: Updated data            │
│ └─ Response: Updated process                            │
│                                                         │
│ DELETE /api/processes/<token_number>                    │
│ ├─ Params: token_number                                │
│ └─ Response: Success message                            │
│                                                         │
│ GET /api/export/excel                                   │
│ ├─ Params: None                                         │
│ └─ Response: Binary Excel file (MIME: .xlsx)           │
│                                                         │
│ POST /api/import/excel                                  │
│ ├─ Body: Multipart form with Excel file               │
│ └─ Response: Import result with record count            │
│                                                         │
│ GET /api/export/list                                    │
│ ├─ Params: None                                         │
│ └─ Response: List of available exports                  │
│                                                         │
│ GET /api/export/download/<filename>                     │
│ ├─ Params: filename                                     │
│ └─ Response: Binary Excel file                          │
│                                                         │
│ POST /api/backup                                        │
│ ├─ Params: None                                         │
│ └─ Response: Backup path and success message            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## File Directory Tree (New Structure)

```
Number Plate Detection Sri Lanka/
│
├── 📄 QUICK_START.md ⭐ NEW
├── 📄 DATA_PERSISTENCE_GUIDE.md ⭐ NEW
├── 📄 IMPLEMENTATION_SUMMARY.md ⭐ NEW
├── 📄 DEPLOYMENT_CHECKLIST.md ⭐ NEW
├── 📄 ARCHITECTURE_GUIDE.md ⭐ NEW (this file)
├── 🔧 setup_persistence.bat ⭐ NEW
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataManagement.jsx ⭐ NEW
│   │   │   ├── PlateDetection.jsx
│   │   │   ├── ProcessQueue.jsx
│   │   │   ├── WaitInForm.jsx
│   │   │   └── ...
│   │   │
│   │   ├── contexts/
│   │   │   └── ProcessContext.jsx ✏️ UPDATED
│   │   │
│   │   ├── services/
│   │   │   ├── dataManagementService.js ⭐ NEW
│   │   │   └── plateDetectionService.js
│   │   │
│   │   ├── App.jsx ✏️ UPDATED
│   │   └── ...
│   │
│   └── package.json
│
├── slnp/
│   ├── 🐍 api.py ✏️ UPDATED (+ new endpoints)
│   ├── 🐍 database.py ⭐ NEW
│   ├── 🐍 excel_handler.py ⭐ NEW
│   ├── best.pt
│   ├── requirements.txt ✏️ UPDATED
│   │
│   ├── 📁 Database/ ⭐ NEW
│   │   ├── 📄 data.json ⭐ AUTO-CREATED
│   │   ├── 📁 exports/ ⭐ NEW
│   │   │   └── process_data_*.xlsx (Excel exports)
│   │   └── 📁 backups/ ⭐ NEW
│   │       └── backup_*.json (JSON backups)
│   │
│   ├── Output/
│   ├── CarPictures/
│   ├── test/
│   └── ...
│
└── README.md (existing)
```

## Legend

```
✏️  = File modified
⭐ = New file/directory
🐍 = Python file
📄 = Documentation/Data file
📁 = Directory
🔧 = Script/Batch file
```

---

**Version**: 1.0
**Last Updated**: January 16, 2026
**Status**: Ready for Production ✅
