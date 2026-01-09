import React, { useState } from 'react'; 
import { TextField, Button, Grid, Paper, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useProcessContext } from '../../contexts/ProcessContext';
import DeliveryTable from './DeliveryTable';

const WaitOutForm = ({ entry, onClose }) => {
    const { updateWaitOutEntry } = useProcessContext();

    const [formData, setFormData] = useState({
        deliveryNumber: '',
        wayoutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        ppeStatus: 'Complete',
        // Initialize deliveryTable for delivery bags based on the requested ones
        deliveryTable: entry.waitIn.deliveryTable.map(item => ({...item, deliveryBag: item.requestedBag})),
        
        // Autofill driver and vehicle from the WaitIn entry
        driverName: entry.waitIn.driverName || entry.driverName || '',
        vehicleNumber: entry.vehicleNumber || entry.waitIn.vehicleNumber || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDeliveryTableChange = (updatedTable) => {
        setFormData((prev) => ({
            ...prev,
            deliveryTable: updatedTable,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.deliveryNumber) {
            alert('Delivery Number is required!');
            return;
        }

        updateWaitOutEntry(entry.tokenNumber, formData);
        alert(`Process for Token ${entry.tokenNumber} Finished!`);
        onClose(); // Close the modal/form
    };

    return (
        <Paper sx={{ p: 3, maxidth: 700, height: '82vh',overflowY: 'auto', mx: 'auto', }}>
            <Typography variant="h5" color="secondary" gutterBottom>
                2. Wait Out - Token: {entry.tokenNumber}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Delivery Number */}
                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth label="Delivery Number" name="deliveryNumber" value={formData.deliveryNumber} onChange={handleChange} />
                    </Grid>
                    {/* Waitout Time (Auto-filled on mount, can be edited) */}
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Waitout Time" name="wayoutTime" value={formData.wayoutTime} onChange={handleChange} disabled />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label = "Driver Name" name='driverName' value={formData.driverName} onChange={handleChange}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label = "Vehicle Number" name='vehicleNumber' value={formData.vehicleNumber} onChange={handleChange}/>
                    </Grid>

                    {/* PPE Status */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Final PPE Status Check</InputLabel>
                            <Select name="ppeStatus" value={formData.ppeStatus} label="Final PPE Status Check" onChange={handleChange}>
                                <MenuItem value="Complete">Complete</MenuItem>
                                
                                <MenuItem value="Failed">Failed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Delivery Bag Table (for filling delivery_bag) */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Delivery Bags</Typography>
                        <DeliveryTable
                            data={formData.deliveryTable}
                            onDataChange={handleDeliveryTableChange}
                            mode="delivery" // Enable delivery bags input
                        />
                    </Grid>

                    {/* Finish Button */}
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="secondary" size="large" fullWidth sx={{ mt: 2 }}>
                            Finish Dispatch Process
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <Button onClick={onClose} sx={{ mt: 2 }}>Cancel</Button>
        </Paper>
    );
};

export default WaitOutForm;