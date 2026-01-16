const API_BASE = 'http://localhost:5000/api';

export const dataManagementService = {
  /**
   * Get all processes
   */
  async getAllProcesses() {
    try {
      const response = await fetch(`${API_BASE}/processes`);
      if (!response.ok) throw new Error('Failed to fetch processes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching processes:', error);
      throw error;
    }
  },

  /**
   * Create a new process
   */
  async createProcess(data) {
    try {
      const response = await fetch(`${API_BASE}/processes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create process');
      return await response.json();
    } catch (error) {
      console.error('Error creating process:', error);
      throw error;
    }
  },

  /**
   * Get a specific process
   */
  async getProcess(tokenNumber) {
    try {
      const response = await fetch(`${API_BASE}/processes/${tokenNumber}`);
      if (!response.ok) throw new Error('Process not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching process:', error);
      throw error;
    }
  },

  /**
   * Update a process
   */
  async updateProcess(tokenNumber, data) {
    try {
      const response = await fetch(`${API_BASE}/processes/${tokenNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update process');
      return await response.json();
    } catch (error) {
      console.error('Error updating process:', error);
      throw error;
    }
  },

  /**
   * Delete a process
   */
  async deleteProcess(tokenNumber) {
    try {
      const response = await fetch(`${API_BASE}/processes/${tokenNumber}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete process');
      return await response.json();
    } catch (error) {
      console.error('Error deleting process:', error);
      throw error;
    }
  },

  /**
   * Export to Excel
   */
  async exportToExcel() {
    try {
      const response = await fetch(`${API_BASE}/export/excel`);
      if (!response.ok) throw new Error('Failed to export');
      return await response.blob();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  },

  /**
   * Import from Excel
   */
  async importFromExcel(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/import/excel`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to import');
      return await response.json();
    } catch (error) {
      console.error('Error importing from Excel:', error);
      throw error;
    }
  },

  /**
   * Create backup
   */
  async createBackup() {
    try {
      const response = await fetch(`${API_BASE}/backup`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return await response.json();
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },

  /**
   * List all exports
   */
  async listExports() {
    try {
      const response = await fetch(`${API_BASE}/export/list`);
      if (!response.ok) throw new Error('Failed to list exports');
      return await response.json();
    } catch (error) {
      console.error('Error listing exports:', error);
      throw error;
    }
  },

  /**
   * Download an export
   */
  async downloadExport(filename) {
    try {
      const response = await fetch(`${API_BASE}/export/download/${filename}`);
      if (!response.ok) throw new Error('Failed to download export');
      return await response.blob();
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  },
};
