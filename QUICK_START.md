# Quick Start Guide - Data Persistence

## 🚀 Quick Setup (2 minutes)

### 1. Install New Dependencies
```bash
cd slnp
pip install openpyxl pandas
```

Or use the setup script:
```bash
setup_persistence.bat
```

### 2. Start Backend
```bash
python slnp/api.py
```

You should see:
```
Starting SLNP Detection API on http://localhost:5000
Data persistence enabled with backend database
Excel import/export functionality available
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

## 📊 What's New

### ✅ Automatic Data Persistence
- All data saved to `slnp/Database/data.json`
- Data survives browser refresh ✓
- Data survives application restart ✓

### ✅ Data Management Dashboard
- New "Data Management" section in UI
- Real-time statistics (Total, Pending, Finished)
- Quick action buttons for export/import/backup

### ✅ Excel Export
**Button**: Export to Excel
- Creates formatted Excel file with all data
- Saved in `slnp/Database/exports/`
- Ready for analysis, backup, or sharing

### ✅ Excel Import
**Button**: Import from Excel
- Upload previously exported files
- Import from custom Excel with compatible format
- Automatically syncs with database

### ✅ Automated Backups
**Button**: Create Backup
- Point-in-time JSON backup
- Saved in `slnp/Database/backups/`
- Easy recovery if needed

### ✅ Data Refresh
**Button**: Refresh Data
- Reload data from backend
- Useful if data was modified externally

## 📁 File Locations

```
Database Directory Structure:
slnp/Database/
├── data.json          ← Main database (auto-created)
├── exports/           ← Excel exports (auto-created)
│   └── process_data_20260116_103045.xlsx
└── backups/           ← JSON backups (auto-created)
    └── backup_20260116_103045.json
```

## 🔧 Configuration

### Backend API (http://localhost:5000)
Already configured in `ProcessContext.jsx`:
```javascript
const API_BASE = 'http://localhost:5000/api';
```

### Database Format
- Format: JSON
- Auto-backup: Yes (create manually or use API)
- Sync interval: Real-time on user action

## 🎯 Common Operations

### Export All Data
1. Open app
2. Go to "Data Management" section
3. Click "Export to Excel"
4. Download starts automatically

### Import Data
1. Click "Import from Excel"
2. Select Excel file
3. System validates and imports
4. Success message shows record count

### Create Backup
1. Click "Create Backup"
2. Backup created with timestamp
3. Find in `slnp/Database/backups/`

### Refresh Data
1. Click "Refresh Data"
2. Data reloads from backend
3. Useful after manual edits

## ⚠️ Important Notes

1. **Backend Must Run**: Backend API must be running for persistence
   - If backend is down, app uses local cache fallback
   - Data still works but won't sync to backend

2. **Database Folder**: `slnp/Database/` must have write permissions

3. **Excel Format**: Only .xlsx and .xls files supported for import

4. **Data Loss Prevention**:
   - Regular backups recommended
   - Export monthly for archive
   - Never delete `slnp/Database/data.json` directly

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Backend unreachable" | Start backend: `python slnp/api.py` |
| Export button disabled | Need at least 1 record in system |
| Import fails | Check file is .xlsx format and has correct structure |
| Data not showing after refresh | Check backend is running, wait 2-3 seconds |
| Database file not created | Ensure `slnp/Database/` folder exists and has write permissions |

## 📞 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/processes` | Get all records |
| POST | `/api/processes` | Create new record |
| PUT | `/api/processes/<token>` | Update record |
| DELETE | `/api/processes/<token>` | Delete record |
| GET | `/api/export/excel` | Export to Excel |
| POST | `/api/import/excel` | Import from Excel |
| POST | `/api/backup` | Create backup |

## 🎓 Learning Path

1. **First Run**: Start both backend and frontend, watch data persist
2. **Export Test**: Add a record, export to Excel, verify file
3. **Import Test**: Export, modify slightly, import back
4. **Backup Test**: Create backup, verify file created
5. **Advanced**: Check Database/data.json structure

## 📚 Additional Resources

- Full Documentation: `DATA_PERSISTENCE_GUIDE.md`
- Backend Source: `slnp/database.py`, `slnp/excel_handler.py`, `slnp/api.py`
- Frontend Source: `frontend/src/contexts/ProcessContext.jsx`
- UI Component: `frontend/src/components/DataManagement.jsx`

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 16, 2026
