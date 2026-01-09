import React, { createContext, useState, useContext } from 'react';

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

  // 3. Retrieve existing counts from LocalStorage
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
    // Store detected vehicle number from plate recognition
    const [detectedVehicleNumber, setDetectedVehicleNumber] = useState('');

    // Function to handle the Wait In (Create) process
    const addWaitInEntry = (formData) => {
        const now = new Date();
        const newEntry = {
            waitIn: formData, // Store the full WaitIn form data
            // tokenNumber: `INSEE-${Math.floor(Math.random() * 900) + 100}-${now.getTime().toString().slice(-4)}`, // Unique token
            // Assuming 'formData.category' holds the selected value like "Marine plus" or "Bulk"
            tokenNumber: generateDailyToken(formData.category),
            
            date: now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
            vehicleNumber: formData.vehicleNumber,
            arrivalTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: 'Pending', // Initial status
            waitOut: null,
        };
        setProcessQueue((prevQueue) => [newEntry, ...prevQueue]); // Add to the front
    };

    // Function to handle the Wait Out (Update) process
    const updateWaitOutEntry = (tokenNumber, waitOutData) => {
        setProcessQueue((prevQueue) =>
            prevQueue.map((entry) => {
                if (entry.tokenNumber === tokenNumber) {
                    // Update the delivery bags in the waitIn object using the new waitOutData table
                    const updatedDeliveryTable = entry.waitIn.deliveryTable.map((item, index) => ({
                        ...item,
                        deliveryBag: waitOutData.deliveryTable[index].deliveryBag, // Copy delivery bags from waitOut form
                    }));

                    return {
                        ...entry,
                        waitIn: { ...entry.waitIn, deliveryTable: updatedDeliveryTable }, // Merge updated table
                        waitOut: waitOutData,
                        status: 'Finished', // Final status
                    };
                }
                return entry;
            })
        );
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