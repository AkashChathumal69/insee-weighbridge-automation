# Data Persistence & Excel Integration Guide

## Overview

Your application now has full data persistence with backend storage and Excel import/export functionality. This means data will no longer be erased when you refresh the application.

## Key Features

### 1. **Backend Data Persistence**
- All process data is automatically saved to a JSON database on the backend
- Data persists across browser refreshes and application restarts
- Automatic local caching as fallback for offline scenarios

### 2. **Excel Export**
- Export all process data to a formatted Excel file
- Includes all vehicle information, delivery data, and status
- Automatically formatted with headers, borders, and proper column widths

### 3. **Excel Import**
- Import previously exported Excel files
- Import data from custom Excel files with compatible structure
- Validate and merge imported data with existing records

### 4. **Automated Backup**
- Create point-in-time backups of your entire database
- Backups are stored with timestamps for version control
- Easy recovery in case of data issues

### 5. **Data Management Dashboard**
- View real-time data statistics (Total, Pending, Finished records)
- Manage exports and imports from a central location
- Refresh data from backend on demand

## Setup Instructions

### Step 1: Install Dependencies

Run the following command in the `slnp` directory:

```bash
pip install -r requirements.txt
```

This installs:
- `openpyxl` - Excel file handling
- `pandas` - Data manipulation
- `sqlalchemy` - Database utilities (optional, for future upgrades)

### Step 2: Start the Backend API

```bash
python api.py
```

The backend will start on `http://localhost:5000` with these endpoints:

#### Data Endpoints
- `GET /api/processes` - Get all process entries
- `POST /api/processes` - Create new process
- `GET /api/processes/<token_number>` - Get specific process
- `PUT /api/processes/<token_number>` - Update process
- `DELETE /api/processes/<token_number>` - Delete process

#### Excel Operations
- `GET /api/export/excel` - Export all data to Excel
- `POST /api/import/excel` - Import data from Excel file
- `GET /api/export/list` - List all exports
- `GET /api/export/download/<filename>` - Download previous export

#### Backup Operations
- `POST /api/backup` - Create a backup

### Step 3: Start the Frontend

```bash
cd frontend
npm install
npm start
```

## Using Data Management Features

### Export Data to Excel

1. Navigate to the **"Data Management"** section in the application
2. Click the **"Export to Excel"** button
3. Your browser will download an Excel file with all process data

**File Location**: `slnp/Database/exports/process_data_YYYYMMDD_HHMMSS.xlsx`

### Import Data from Excel

1. Click the **"Import from Excel"** button
2. Select your Excel file (.xlsx or .xls format)
3. The system will validate and import the data
4. Success message will show number of records imported

### Create a Backup

1. Click the **"Create Backup"** button
2. A backup JSON file is created with timestamp
3. Backups are stored in `slnp/Database/backups/`

**File Location**: `slnp/Database/backups/backup_YYYYMMDD_HHMMSS.json`

### Refresh Data

Click the **"Refresh Data"** button to reload all data from the backend if needed.

## Database Structure

### Main Database
- **Location**: `slnp/Database/data.json`
- **Format**: JSON with the following structure:

```json
{
  "processes": [
    {
      "tokenNumber": "S-01",
      "vehicleNumber": "ABC-1234",
      "date": "12/15/2026",
      "arrivalTime": "10:30",
      "status": "Finished",
      "waitIn": { ... },
      "waitOut": { ... },
      "id": "timestamp",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ],
  "daily_tokens": { ... },
  "last_updated": "ISO timestamp"
}
```

## Excel File Format

When you export to Excel, the file includes:

| Column | Content |
|--------|---------|
| Token Number | Unique token identifier (e.g., S-01) |
| Vehicle Number | License plate number |
| Date | Arrival date |
| Arrival Time | Time of arrival |
| Status | Pending or Finished |
| Driver Name, Phone, Town | Driver information |
| Driver License, Alcohol Test | Driver compliance info |
| Helper Name, Phone, Town, Identity | Helper information |
| Helper Alcohol Test | Helper compliance |
| Vehicle Insurance | Insurance status |
| PPE Numbers | Personal protective equipment numbers |
| Brand Requested/Delivered | Delivery data per brand |
| Departure Time, Total Issue, Notes | Departure information |

## Data Flow Diagram

```
Frontend (React)
    ↓ Submit Form
Backend API (Flask)
    ↓ Save/Update
Database (JSON)
    ↓
File System (exports, backups)
```

## Troubleshooting

### Backend Not Connecting
- Ensure backend is running: `python api.py`
- Check if port 5000 is available
- Verify CORS is enabled in API
- Fallback to local cache will occur automatically

### Export Not Working
- Ensure you have at least one record
- Check `slnp/Database/exports/` directory exists
- Verify pandas and openpyxl are installed

### Import File Invalid
- Ensure file is .xlsx or .xls format
- Verify file structure matches export format
- Check file is not corrupted

### Data Not Persisting
- Verify backend API is running
- Check `slnp/Database/` directory has write permissions
- Look for error messages in backend console

## API Response Examples

### Get All Processes
```json
{
  "success": true,
  "data": [ ... ],
  "count": 15
}
```

### Export to Excel
Returns binary Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

### Import from Excel
```json
{
  "success": true,
  "message": "Successfully imported 10 records",
  "count": 10,
  "data": [ ... ]
}
```

## Best Practices

1. **Regular Backups**: Create backups before major operations
2. **Export Archive**: Export monthly for archival purposes
3. **Import Validation**: Always check imported data after import
4. **Clear Old Exports**: Periodically clean up old export files to save space
5. **Monitor Database Size**: Check `data.json` size and archive if needed

## Migration from Old System

If you have data from the old localStorage-only system:

1. Export current data from old system if possible
2. Convert to compatible Excel format
3. Use the Import feature to bring data into new system
4. Verify data integrity in the Data Management dashboard

## File Locations Reference

```
project-root/
├── slnp/
│   ├── api.py (main backend)
│   ├── database.py (persistence layer)
│   ├── excel_handler.py (export/import)
│   ├── Database/
│   │   ├── data.json (main database)
│   │   ├── exports/ (Excel files)
│   │   └── backups/ (JSON backups)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── DataManagement.jsx (UI)
│       │   └── ...
│       ├── contexts/
│       │   └── ProcessContext.jsx (updated)
│       └── services/
│           ├── dataManagementService.js (new)
│           └── ...
```

## Support & Next Steps

### Possible Enhancements
- Database migration to SQLite/PostgreSQL for larger datasets
- Advanced filtering and searching in Data Management
- Scheduled automated backups
- Data analytics and reporting dashboards
- Multi-user access control
- Cloud backup integration

### For Developers
All API endpoints are RESTful and can be integrated with:
- Mobile applications
- Desktop tools
- Business intelligence platforms
- ERP systems

---

**Last Updated**: January 16, 2026
**Version**: 1.0 (with Data Persistence)
