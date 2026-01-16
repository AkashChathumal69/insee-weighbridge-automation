import json
import os
from datetime import datetime
from pathlib import Path

# Database file path
DB_PATH = "./Database/data.json"
BACKUP_PATH = "./Database/backups"

# Ensure directories exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(BACKUP_PATH, exist_ok=True)


class Database:
    """Simple JSON-based database for process queue data"""
    
    @staticmethod
    def initialize():
        """Initialize database with empty structure if it doesn't exist"""
        if not os.path.exists(DB_PATH):
            initial_data = {
                "processes": [],
                "daily_tokens": {},
                "last_updated": datetime.now().isoformat()
            }
            Database.save(initial_data)
    
    @staticmethod
    def load():
        """Load all data from database"""
        try:
            if os.path.exists(DB_PATH):
                with open(DB_PATH, 'r') as f:
                    return json.load(f)
            else:
                return {"processes": [], "daily_tokens": {}, "last_updated": datetime.now().isoformat()}
        except Exception as e:
            print(f"Error loading database: {e}")
            return {"processes": [], "daily_tokens": {}, "last_updated": datetime.now().isoformat()}
    
    @staticmethod
    def save(data):
        """Save data to database with timestamp"""
        try:
            data["last_updated"] = datetime.now().isoformat()
            with open(DB_PATH, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving database: {e}")
            return False
    
    @staticmethod
    def add_process(process_data):
        """Add a new process entry"""
        data = Database.load()
        process_data["id"] = str(datetime.now().timestamp())  # Unique ID
        process_data["created_at"] = datetime.now().isoformat()
        data["processes"].insert(0, process_data)  # Add to front
        Database.save(data)
        return process_data
    
    @staticmethod
    def update_process(token_number, updated_data):
        """Update an existing process entry"""
        data = Database.load()
        for i, process in enumerate(data["processes"]):
            if process.get("tokenNumber") == token_number:
                data["processes"][i].update(updated_data)
                data["processes"][i]["updated_at"] = datetime.now().isoformat()
                Database.save(data)
                return data["processes"][i]
        return None
    
    @staticmethod
    def get_all_processes():
        """Get all process entries"""
        data = Database.load()
        return data.get("processes", [])
    
    @staticmethod
    def get_process_by_token(token_number):
        """Get a specific process by token number"""
        data = Database.load()
        for process in data.get("processes", []):
            if process.get("tokenNumber") == token_number:
                return process
        return None
    
    @staticmethod
    def delete_process(token_number):
        """Delete a process entry"""
        data = Database.load()
        data["processes"] = [p for p in data.get("processes", []) if p.get("tokenNumber") != token_number]
        Database.save(data)
        return True
    
    @staticmethod
    def backup():
        """Create a backup of the database"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(BACKUP_PATH, f"backup_{timestamp}.json")
            data = Database.load()
            with open(backup_file, 'w') as f:
                json.dump(data, f, indent=2)
            return backup_file
        except Exception as e:
            print(f"Error creating backup: {e}")
            return None
    
    @staticmethod
    def clear_all():
        """Clear all data (use with caution)"""
        data = {"processes": [], "daily_tokens": {}, "last_updated": datetime.now().isoformat()}
        Database.save(data)
        return True


# Initialize database on import
Database.initialize()
