import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useProcessContext } from '../../contexts/ProcessContext';
import DeliveryTable from './DeliveryTable';

const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const WaitInForm = () => {
  const { addWaitInEntry, getInitialFormData, detectedVehicleNumber, setDetectedVehicleNumber } = useProcessContext();

  const [formData, setFormData] = useState({
    ...getInitialFormData(),
    arrivalDate: getCurrentDate(),
    arrivalTime: getCurrentTime(),
    vehicleInsurance: true,
    category: 'Sanstha',
    driver: { name: '', town: '', phone: '', license: '', alcoholTest: 'low' },
    helper: { name: '', town: '', phone: '', id: '', alcoholTest: 'low' },
  });

  // Auto update date & time on mount, and auto-fill detected vehicle number
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      arrivalDate: getCurrentDate(),
      arrivalTime: getCurrentTime(),
      vehicleNumber: detectedVehicleNumber || prev.vehicleNumber,
    }));
  }, [detectedVehicleNumber]);

  // Handle input changes (nested supported)
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDeliveryTableChange = (updatedTable) => {
    setFormData((prev) => ({ ...prev, deliveryTable: updatedTable }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.driverName) {
      alert('Vehicle Number and Driver Name are required!');
      return;
    }

    const finalData = {
      ...formData,
      arrivalDate: getCurrentDate(),
      arrivalTime: getCurrentTime(),
    };

    addWaitInEntry(finalData);
    alert(`Token created for ${finalData.vehicleNumber}`);

    // Reset form
    setFormData({
      ...getInitialFormData(),
      arrivalDate: getCurrentDate(),
      arrivalTime: getCurrentTime(),
      vehicleInsurance: true,
      category: 'Sanstha',
      driver: { name: '', town: '', phone: '', license: '', alcoholTest: 'low' },
      helper: { name: '', town: '', phone: '', id: '', alcoholTest: 'low' },
    });
    // Clear detected number after submission
    setDetectedVehicleNumber('');
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Vehicle Info */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Vehicle Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              required
              fullWidth
              size="small"
              label="Vehicle Number"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <MenuItem value="Sanstha">Sanstha</MenuItem>
                <MenuItem value="Marine plus">Marine plus</MenuItem>
                <MenuItem value="Mahamera">Mahamera</MenuItem>
                <MenuItem value="Scamale">Scamale</MenuItem>
                <MenuItem value="red slow">Red Flow</MenuItem>
                <MenuItem value="Bulk">Bulk</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Arrival Date"
              type="date"
              value={formData.arrivalDate}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Arrival Time"
              type="time"
              value={formData.arrivalTime}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
          </Grid>



          {/* slnp number detection */}

          

          {/* Driver Details */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Driver Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              required
              fullWidth
              size="small"
              label="Driver Name"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Town"
              name="driver.town"
              value={formData.driver.town}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Driver Phone"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="License No"
              name="driver.license"
              value={formData.driver.license}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Alcohol Test</InputLabel>
              <Select
                name="driver.alcoholTest"
                value={formData.driver.alcoholTest}
                onChange={handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Driver PPE"
              name="driverPPENumber"
              value={formData.driverPPENumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.vehicleInsurance}
                  onChange={handleChange}
                  name="vehicleInsurance"
                  color="success"
                />
              }
              label={formData.vehicleInsurance ? '✓ Insured' : '✗ Not Insured'}
            />
          </Grid>

          {/* Helper Details */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Helper Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Helper Name" name="helper.name" value={formData.helper.name} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Town"
              name="helper.town"
              value={formData.helper.town}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Helper Phone"
              name="helper.phone"
              value={formData.helper.phone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Helper ID"
              name="helper.id"
              value={formData.helper.id}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Alcohol Test</InputLabel>
              <Select
                name="helper.alcoholTest"
                value={formData.helper.alcoholTest}
                onChange={handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>

           <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Helper PPE"
              name="helperPPENumber"
              value={formData.helperPPENumber}
              onChange={handleChange}
            />
          </Grid>

          {/* Delivery Table */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Requested Delivery Bags
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <DeliveryTable
              data={formData.deliveryTable}
              onDataChange={handleDeliveryTableChange}
              mode="requested"
            />
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 2,
                px: 6,
                fontWeight: 700,
                backgroundColor: '#ff0000ff',
                '&:hover': { backgroundColor: '#cc0000ff' },
              }}
            >
              ✓ Create Token & Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default WaitInForm;
