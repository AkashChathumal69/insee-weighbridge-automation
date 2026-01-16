import React, { createContext, useState, useContext, useEffect } from 'react';

// API Base URL
const API_BASE = 'http://localhost:5000/api';

// =================================================================
// 1. Context Creation
// =================================================================
const ProcessContext = createContext();


// =================================================================
// Token Creation
// =================================================================

const generateDailyToken = (categoryType) => {
  // 1. Define your specific codes
  const codeMap = {
    'Marine plus': 'MP',
    'Sanstha': 'S',
    'Mahamera': 'MM',
    'Scamale': 'WH',
    'red slow': 'R',
    'Bulk': 'B'
  };

  // Get the prefix (default to 'XX' if the category isn't found)
  const prefix = codeMap[categoryType] || 'XX';

  // 2. Get today's date as a string (e.g., "2023-10-27") to track 12 AM resets
  const todayStr = new Date().toISOString().split('T')[0];

  // 3. Retrieve existing counts from LocalStorage (fallback for offline)
  const storedData = localStorage.getItem('dailyTokenCounts');
  let data = storedData ? JSON.parse(storedData) : { date: todayStr, counts: {} };

  // 4. Check if it's a new day. If the stored date is different from today, reset everything.
  if (data.date !== todayStr) {
    data = { date: todayStr, counts: {} };
  }

  // 5. Get the current count for this specific prefix, or start at 0
  const currentCount = data.counts[prefix] || 0;
  const newCount = currentCount + 1;

  // 6. Update the count and save it back to storage
  data.counts[prefix] = newCount;
  localStorage.setItem('dailyTokenCounts', JSON.stringify(data));

  // 7. Return formatted string (e.g., "MP-01"). padStart(2, '0') adds the leading zero.
  return `${prefix}-${String(newCount).padStart(2, '0')}`;
};



// =================================================================
// Initial Data Structure for a new entry
// =================================================================
const getInitialWaitInFormData = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return {
    // Auto-fill (Filled by addWaitInEntry logic)
    vehicleNumber: '', // This should come from the form, but token, time, date are auto
    category: 'Sanstha', // Category for token generation
    arrivalDate: dateStr,
    arrivalTime: timeStr,
    // Manual - Driver Details
    driverName: '',
    driverPhone: '',
    driverTown: '',
    driverLicense: '',
    driverAlcoholTest: 'low',
    // Manual - Helper Details
    helperName: '',
    helperIdentity: '',
    helperPhone: '',
    helperTown: '',
    helperAlcoholTest: 'low',
    // Vehicle Info
    vehicleInsurance: false,
    driverPPENumber: '',
    helperPPENumber: '',
    // Delivery Table Data (Initial Requested bags)
    deliveryTable: [
        { brand: 'Sanstha', requestedBag: 0, deliveryBag: 0 },
        { brand: 'Marine Plus', requestedBag: 0, deliveryBag: 0 },
        { brand: 'Mahamera', requestedBag: 0, deliveryBag: 0 },
        { brand: 'Red Flow', requestedBag: 0, deliveryBag: 0 },
        { brand: 'Bulk', requestedBag: 0, deliveryBag: 0 },
        { brand: 'Scamale', requestedBag: 0, deliveryBag: 0 },
    ],
};
};

// =================================================================
// 2. Provider Component
// =================================================================
export const ProcessProvider = ({ children }) => {
    // Main application state: an array of vehicle process objects
    const [processQueue, setProcessQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Store detected vehicle number from plate recognition
    const [detectedVehicleNumber, setDetectedVehicleNumber] = useState('');

    // Load data from backend on mount
    useEffect(() => {
        loadProcessesFromBackend();
    }, []);

    // Function to load processes from backend
    const loadProcessesFromBackend = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/processes`);
            if (response.ok) {
                const result = await response.json();
                setProcessQueue(result.data || []);
                setError(null);
            } else {
                console.warn('Failed to load processes from backend, using local cache');
                // Fall back to empty array or local storage
                const cached = localStorage.getItem('processQueue');
                if (cached) {
                    setProcessQueue(JSON.parse(cached));
                }
            }
        } catch (err) {
            console.warn('Backend connection failed, using local cache:', err);
            // Fall back to local storage
            const cached = localStorage.getItem('processQueue');
            if (cached) {
                setProcessQueue(JSON.parse(cached));
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the Wait In (Create) process
    const addWaitInEntry = async (formData) => {
        try {
            const now = new Date();
            const newEntry = {
                waitIn: formData,
                tokenNumber: generateDailyToken(formData.category),
                date: now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                vehicleNumber: formData.vehicleNumber,
                arrivalTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                status: 'Pending',
                waitOut: null,
            };

            // Try to save to backend
            try {
                const response = await fetch(`${API_BASE}/processes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEntry),
                });

                if (!response.ok) throw new Error('Backend save failed');
            } catch (err) {
                console.warn('Could not save to backend, saving locally:', err);
            }

            // Update local state
            setProcessQueue((prevQueue) => [newEntry, ...prevQueue]);
            
            // Cache to local storage as fallback
            const updated = [newEntry, ...processQueue];
            localStorage.setItem('processQueue', JSON.stringify(updated));
        } catch (err) {
            setError('Failed to add entry: ' + err.message);
            console.error('Error adding wait in entry:', err);
        }
    };

    // Function to handle the Wait Out (Update) process
    const updateWaitOutEntry = async (tokenNumber, waitOutData) => {
        try {
            const updatedQueue = processQueue.map((entry) => {
                if (entry.tokenNumber === tokenNumber) {
                    const updatedDeliveryTable = entry.waitIn.deliveryTable.map((item, index) => ({
                        ...item,
                        deliveryBag: waitOutData.deliveryTable[index].deliveryBag,
                    }));

                    return {
                        ...entry,
                        waitIn: { ...entry.waitIn, deliveryTable: updatedDeliveryTable },
                        waitOut: waitOutData,
                        status: 'Finished',
                    };
                }
                return entry;
            });

            // Try to update backend
            const updatedEntry = updatedQueue.find(e => e.tokenNumber === tokenNumber);
            if (updatedEntry) {
                try {
                    const response = await fetch(`${API_BASE}/processes/${tokenNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedEntry),
                    });

                    if (!response.ok) throw new Error('Backend update failed');
                } catch (err) {
                    console.warn('Could not update backend, updating locally:', err);
                }
            }

            setProcessQueue(updatedQueue);
            
            // Cache to local storage
            localStorage.setItem('processQueue', JSON.stringify(updatedQueue));
        } catch (err) {
            setError('Failed to update entry: ' + err.message);
            console.error('Error updating wait out entry:', err);
        }
    };

    // Export to Excel
    const exportToExcel = async () => {
        try {
            const response = await fetch(`${API_BASE}/export/excel`);
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `process_data_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to export: ' + err.message);
            console.error('Error exporting to Excel:', err);
        }
    };

    // Import from Excel
    const importFromExcel = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/import/excel`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Import failed');

            const result = await response.json();
            
            // Reload data after import
            await loadProcessesFromBackend();
            
            return result;
        } catch (err) {
            setError('Failed to import: ' + err.message);
            console.error('Error importing from Excel:', err);
            throw err;
        }
    };

    // Create backup
    const createBackup = async () => {
        try {
            const response = await fetch(`${API_BASE}/backup`, { method: 'POST' });
            if (!response.ok) throw new Error('Backup failed');

            const result = await response.json();
            return result;
        } catch (err) {
            setError('Failed to create backup: ' + err.message);
            console.error('Error creating backup:', err);
            throw err;
        }
    };

    // Function to get the initial form data for reset
    const getInitialFormData = () => getInitialWaitInFormData();

    return (
        <ProcessContext.Provider
            value={{
                processQueue,
                addWaitInEntry,
                updateWaitOutEntry,
                getInitialFormData,
                detectedVehicleNumber,
                setDetectedVehicleNumber,
                exportToExcel,
                importFromExcel,
                createBackup,
                loading,
                error,
                loadProcessesFromBackend,
            }}
        >
            {children}
        </ProcessContext.Provider>
    );
};

// =================================================================
// 3. Custom Hook to use the context
// =================================================================
export const useProcessContext = () => {
    return useContext(ProcessContext);
};