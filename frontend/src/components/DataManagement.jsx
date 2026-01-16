import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Snackbar,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BackupIcon from '@mui/icons-material/Backup';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useProcessContext } from '../contexts/ProcessContext';

const DataManagement = () => {
  const {
    processQueue,
    exportToExcel,
    loading,
    error,
    loadProcessesFromBackend,
  } = useProcessContext();

  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await exportToExcel();
      setSuccessMessage('Data exported to Excel successfully!');
    } catch (err) {
      setErrorMessage('Failed to export data: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // const handleImportExcel = async (file) => {
  //   try {
  //     const result = await importFromExcel(file);
  //     setSuccessMessage(`Imported ${result.count || 0} records successfully!`);
  //   } catch (err) {
  //     setErrorMessage('Failed to import data: ' + err.message);
  //   }
  // };

  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      await loadProcessesFromBackend();
      setSuccessMessage('Data refreshed successfully!');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Failed to refresh data: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardHeader
          title="Data Management"
          subheader="Export, Import, and Backup your data"
          avatar={<BackupIcon sx={{ fontSize: 32 }} />}
        />
        <Divider />
        <CardContent>
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={exporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                onClick={handleExportExcel}
                disabled={exporting || processQueue.length === 0 || loading}
              >
                Export to Excel
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleRefreshData}
                disabled={loading || refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Summary
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {loading ? <CircularProgress size={24} /> : processQueue.length}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {processQueue.filter((p) => p.status === 'Pending').length}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Finished
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {processQueue.filter((p) => p.status === 'Finished').length}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Records
            </Typography>
            <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
              {processQueue.length > 0 ? (
                <List dense>
                  {processQueue.slice(0, 5).map((record) => (
                    <ListItem key={record.tokenNumber} divider>
                      <ListItemText
                        primary={`${record.tokenNumber} - ${record.vehicleNumber}`}
                        secondary={`${record.date} | Status: ${record.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No records available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </CardContent>
      </Card>


      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataManagement;
