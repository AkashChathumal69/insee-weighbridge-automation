import React from 'react';
import { ProcessProvider, useProcessContext } from './contexts/ProcessContext';
import { Box, Container, Grid, Paper, Typography, Button, List, ListItem, Divider } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DispatchStats from './components/DispatchStats';
import ProcessQueue from './components/ProcessQueue';
import WaitInForm from './components/forms/WaitInForm';
import PlateDetection from './components/PlateDetection';
import DataManagement from './components/DataManagement';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc3545',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const SIDEBAR_WIDTH = 200;

function App() {
  // Sidebar component uses the process context and renders navigation + quick counts
  const SidebarNav = () => {
    const { processQueue } = useProcessContext();
    const pendingCount = processQueue.filter(e => e.status === 'Pending').length;
    const finishedCount = processQueue.filter(e => e.status === 'Finished').length;

    return (
      <div>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#ffffffff' }}>
          INSEE Vehicle
        </Typography>
        <List>
          {/* --- ADDED HOME ITEM --- */}
          <ListItem disablePadding>
            <Button href="#" fullWidth sx={{ justifyContent: 'flex-start', pl: 2, color: '#ffffffff' }}>
              Home
            </Button>
          </ListItem>

          <ListItem disablePadding>
            <Button href="#plate-detection" fullWidth sx={{ justifyContent: 'flex-start', pl: 2 , color: '#ffffffff'}}>
              Plate Detection
            </Button>
          </ListItem>
          
          <ListItem disablePadding>
            <Button href="#data-table" fullWidth sx={{ justifyContent: 'flex-start', pl: 2 , color: '#ffffffff'}}>
              Data Table
            </Button>
          </ListItem>

          <ListItem disablePadding>
            <Button href="#data-management" fullWidth sx={{ justifyContent: 'flex-start', pl: 2 , color: '#ffffffff'}}>
              Data Management
            </Button>
          </ListItem>

          <ListItem disablePadding>
            <Button href="#data-visualization" fullWidth sx={{ justifyContent: 'flex-start', pl: 2 , color: '#ffffffff'}}>
              Data Visualization
            </Button>
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} color="#ffffffff"/>
        <Typography variant="subtitle2" color="text.background">Quick Overview</Typography>
        <Typography sx={{ mt: 1 }}>Pending: {pendingCount}</Typography>
        <Typography>Finished: {finishedCount}</Typography>
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <ProcessProvider>
        <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
          {/* Main Content with Sidebar */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <Paper
              elevation={0}
              sx={{
                width: SIDEBAR_WIDTH,
                bgcolor: '#faf8f8ff',
                borderRight: '1px solid #ddd',
                p: 3,
                overflowY: 'auto',
                backgroundColor: '#ff0000ff',
              }}
            >
              <SidebarNav />
            </Paper>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, backgroundColor: '#f5f5f5' }}>
              <Container maxWidth="lg">
                <Grid container spacing={3}>
                  {/* Plate Detection Section */}
                  <Grid item xs={12} id="plate-detection">
                    <Paper elevation={2} sx={{ p: 3, borderTop: '4px solid #1976d2' }}>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#000000ff' }}>
                         ✓ Number Plate Detection
                      </Typography>
                      <PlateDetection />
                    </Paper>
                  </Grid>

                  {/* Wait In Form Section */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, borderTop: '4px solid #ff0000ff' }}>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#000000ff' }}>
                        ✓ Vehicle Arrival (Weigh In)
                      </Typography>
                      <WaitInForm />
                    </Paper>
                  </Grid>

                  {/* Process Queue Section */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, borderTop: '4px solid #dc3545' }}>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#000000ff' }}>
                        📋 Active Process Queue
                      </Typography>
                      <ProcessQueue />
                    </Paper>
                  </Grid>

                  {/* Data Table Section */}
                  <Grid item xs={12} id="data-table">
                    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                      <Typography variant="h6">Data Table</Typography>
                      <Typography variant="body2" color="text.secondary">(Placeholder section for tabular data export)</Typography>
                    </Paper>
                  </Grid>

                  {/* Data Management Section */}
                  <Grid item xs={12} id="data-management">
                    <DataManagement />
                  </Grid>

                  {/* Data Visualization Section */}
                  <Grid item xs={12} id="data-visualization">
                    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                      <Typography variant="h6">Data Visualization</Typography>
                      <Typography variant="body2" color="text.secondary">(Placeholder section for charts and graphs)</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Dispatch stats moved to bottom of the page */}
                <Box sx={{ mt: 4 }}>
                  <DispatchStats />
                </Box>
              </Container>
            </Box>
          </Box>
        </Box>
      </ProcessProvider>
    </ThemeProvider>
  );
}

export default App;