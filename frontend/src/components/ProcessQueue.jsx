import React from 'react';
import { Grid, Typography, Paper, Tabs, Tab } from '@mui/material';
import ProcessCard from './cards/ProcessCard';
import { useProcessContext } from '../contexts/ProcessContext';

const ProcessQueue = () => {
    const { processQueue } = useProcessContext();
    const [tabValue, setTabValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const pendingEntries = processQueue.filter(e => e.status === 'Pending');
    const finishedEntries = processQueue.filter(e => e.status === 'Finished');

    const displayEntries = tabValue === 0 ? pendingEntries : finishedEntries;

    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={handleChange} centered>
                <Tab label={`Pending Tokens (${pendingEntries.length})`} />
                <Tab label={`Finished Tokens (${finishedEntries.length})`} />
            </Tabs>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {displayEntries.length === 0 ? (
                    <Grid item xs={12} sx={{ textAlign: 'center', py: 5 }}>
                        <Typography variant="h6" color="text.secondary">
                            {tabValue === 0 ? "No vehicles currently waiting (Pending)." : "No dispatches completed yet."}
                        </Typography>
                    </Grid>
                ) : (
                    displayEntries.map((entry) => (
                        <Grid item xs={12} sm={6} lg={4} key={entry.tokenNumber}>
                            <ProcessCard entry={entry} />
                        </Grid>
                    ))
                )}
            </Grid>
        </Paper>
    );
};

export default ProcessQueue;